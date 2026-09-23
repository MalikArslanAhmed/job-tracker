import { NextResponse } from "next/server";
import {
  createFollowUp,
  deleteFollowUp,
  getDashboardFollowUps,
  getFollowUpsByApplicationId,
  markFollowUpNoResponse,
  markFollowUpResponseReceived,
  markFollowUpSent,
  updateFollowUp,
} from "@/lib/followUps";
import { sendGmail } from "@/lib/gmail";
import { createFollowUpEmail } from "@/lib/followUpEmail";
import { getApplicationById } from "@/lib/applications";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get(
      "applicationId",
    );

    if (applicationId) {
      const followUps =
        getFollowUpsByApplicationId(
          Number(applicationId),
        );

      return NextResponse.json(followUps);
    }

    const followUps = getDashboardFollowUps();

    return NextResponse.json(followUps);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load follow-ups." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.application_id || !body.follow_up_date) {
      return NextResponse.json(
        {
          error:
            "Application ID and follow-up date are required.",
        },
        { status: 400 },
      );
    }

    const status =
      body.status === "Sent"
        ? "Sent"
        : "Planned";

    const responseStatus =
      body.response_status === "Received"
        ? "Received"
        : body.response_status === "No Response"
          ? "No Response"
          : "Waiting";

    const result = createFollowUp({
      application_id: Number(body.application_id),
      follow_up_number: Number(body.follow_up_number) || 1,
      follow_up_date: body.follow_up_date,
      status,
      response_status: responseStatus,
      email_to: body.email_to,
      email_subject: body.email_subject,
      email_message: body.email_message,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("CREATE FOLLOW-UP ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create follow-up.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    /*
* Preview follow-up email without sending it.
*/
    if (body.action === "preview") {
      const followUpId = Number(body.id);

      const followUps = getDashboardFollowUps();
      const followUp = followUps.find(
        (item) => item.id === followUpId,
      );

      if (!followUp) {
        return NextResponse.json(
          { error: "Follow-up not found." },
          { status: 404 },
        );
      }

      if (followUp.status !== "Planned") {
        return NextResponse.json(
          {
            error:
              "Only planned follow-ups can be previewed.",
          },
          { status: 400 },
        );
      }

      const application = getApplicationById(
        followUp.application_id,
      );

      if (!application) {
        return NextResponse.json(
          { error: "Application not found." },
          { status: 404 },
        );
      }

      if (!application.contact_email) {
        return NextResponse.json(
          {
            error:
              "No contact email is available for this application.",
          },
          { status: 400 },
        );
      }

      const email = createFollowUpEmail({
        company: application.company,
        jobTitle: application.job_title,
        contactPerson: application.contact_person,
        followUpNumber: followUp.follow_up_number,
      });

      return NextResponse.json({
        success: true,
        followUpId: followUp.id,
        followUpNumber: followUp.follow_up_number,
        to: application.contact_email,
        subject: email.subject,
        message: email.message,
      });
    }
    if (body.action === "send_due") {
      const followUps = getDashboardFollowUps();

      const company =
        typeof body.company === "string"
          ? body.company.trim()
          : "";

      const today = new Date();

      const todayString =
        `${today.getFullYear()}-${String(
          today.getMonth() + 1,
        ).padStart(2, "0")}-${String(
          today.getDate(),
        ).padStart(2, "0")}`;

      const dueFollowUps = followUps.filter(
        (followUp) => {
          if (
            followUp.status !== "Planned" ||
            followUp.follow_up_date > todayString
          ) {
            return false;
          }

          // If a company was supplied,
          // only include follow-ups for that company.
          if (company) {
            return (
              followUp.company?.trim().toLowerCase() ===
              company.toLowerCase()
            );
          }

          // No company supplied:
          // keep the existing global behavior.
          return true;
        },
      );

      let sent = 0;
      let skipped = 0;

      const skippedDetails: string[] = [];

      for (const followUp of dueFollowUps) {
        const application = getApplicationById(
          followUp.application_id,
        );

        if (!application) {
          skipped++;

          skippedDetails.push(
            `Follow-up #${followUp.follow_up_number} — Application not found`,
          );

          continue;
        }

        if (!application.contact_email) {
          skipped++;

          skippedDetails.push(
            `${application.company} — ${application.job_title} — No contact email`,
          );

          continue;
        }

        try {
          const email = createFollowUpEmail({
            company: application.company,
            jobTitle: application.job_title,
            contactPerson: application.contact_person,
            followUpNumber: followUp.follow_up_number,
          });

          await sendGmail({
            to: application.contact_email,
            subject: email.subject,
            message: email.message,
          });

          markFollowUpSent(followUp.id, {
            email_to: application.contact_email,
            email_subject: email.subject,
            email_message: email.message,
          });

          const nextFollowUpNumber =
            followUp.follow_up_number + 1;

          if (
            application.follow_up_enabled &&
            nextFollowUpNumber <=
            application.max_follow_ups
          ) {
            const nextFollowUpDate = (() => {
              const date = new Date();
              let daysAdded = 0;

              while (
                daysAdded <
                application.follow_up_wait_days
              ) {
                date.setDate(
                  date.getDate() + 1,
                );

                const day = date.getDay();

                if (day !== 0 && day !== 6) {
                  daysAdded++;
                }
              }

              return `${date.getFullYear()}-${String(
                date.getMonth() + 1,
              ).padStart(2, "0")}-${String(
                date.getDate(),
              ).padStart(2, "0")}`;
            })();

            createFollowUp({
              application_id: application.id,
              follow_up_number:
                nextFollowUpNumber,
              follow_up_date: nextFollowUpDate,
              status: "Planned",
              response_status: "Waiting",
              notes:
                `Automatically planned ${application.follow_up_wait_days} business days after follow-up #${followUp.follow_up_number} was sent.`,
            });
          }

          sent++;
        } catch (error) {
          console.error(
            `Failed to send follow-up ${followUp.id}:`,
            error,
          );

          skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        sent,
        skipped,
        skippedDetails,
      });
    }
    if (!body.id) {
      return NextResponse.json(
        { error: "Follow-up ID is required." },
        { status: 400 },
      );
    }
    /*
    * Send follow-up email.
    */
    if (body.action === "send") {
      const followUpId = Number(body.id);

      const followUps = getDashboardFollowUps();
      const followUp = followUps.find(
        (item) => item.id === followUpId,
      );

      if (!followUp) {
        return NextResponse.json(
          { error: "Follow-up not found." },
          { status: 404 },
        );
      }

      if (followUp.status !== "Planned") {
        return NextResponse.json(
          { error: "This follow-up has already been processed." },
          { status: 400 },
        );
      }

      const application = getApplicationById(
        followUp.application_id,
      );

      if (!application) {
        return NextResponse.json(
          { error: "Application not found." },
          { status: 404 },
        );
      }

      if (!application.contact_email) {
        return NextResponse.json(
          {
            error:
              "No contact email is available for this application.",
          },
          { status: 400 },
        );
      }
      const generatedEmail = createFollowUpEmail({
        company: application.company,
        jobTitle: application.job_title,
        contactPerson: application.contact_person,
        followUpNumber: followUp.follow_up_number,
      });

      const emailTo =
        typeof body.email_to === "string" &&
          body.email_to.trim()
          ? body.email_to.trim()
          : application.contact_email;

      const emailSubject =
        typeof body.email_subject === "string" &&
          body.email_subject.trim()
          ? body.email_subject.trim()
          : generatedEmail.subject;

      const emailMessage =
        typeof body.email_message === "string" &&
          body.email_message.trim()
          ? body.email_message
          : generatedEmail.message;

      const gmailResponse = await sendGmail({
        to: emailTo,
        subject: emailSubject,
        message: emailMessage,
      });

      markFollowUpSent(followUpId, {
        email_to: emailTo,
        email_subject: emailSubject,
        email_message: emailMessage,
      });

      /*
      * Schedule the next follow-up.
      */
      const nextFollowUpNumber =
        followUp.follow_up_number + 1;

      if (
        application.follow_up_enabled &&
        nextFollowUpNumber <= application.max_follow_ups
      ) {
        const nextFollowUpDate = (() => {
          const date = new Date();
          let daysAdded = 0;

          while (daysAdded < application.follow_up_wait_days) {
            date.setDate(date.getDate() + 1);

            const day = date.getDay();

            if (day !== 0 && day !== 6) {
              daysAdded++;
            }
          }

          return `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}-${String(
            date.getDate(),
          ).padStart(2, "0")}`;
        })();

        createFollowUp({
          application_id: application.id,
          follow_up_number: nextFollowUpNumber,
          follow_up_date: nextFollowUpDate,
          status: "Planned",
          response_status: "Waiting",
          notes:
            `Automatically planned ${application.follow_up_wait_days} days after follow-up #${followUp.follow_up_number} was sent.`,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Follow-up email sent successfully.",
        messageId: gmailResponse.id,
      });
    }
    /*
    * Mark follow-up as sent.
    */
    if (body.action === "sent") {
      markFollowUpSent(Number(body.id), {
        email_to: body.email_to,
        email_subject: body.email_subject,
        email_message: body.email_message,
      });

      return NextResponse.json({
        success: true,
      });
    }

    /*
    * Mark response as received.
    */
    if (body.action === "response_received") {
      markFollowUpResponseReceived(Number(body.id));

      return NextResponse.json({
        success: true,
      });
    }

    /*
    * Mark follow-up as having no response.
    */
    if (body.action === "no_response") {
      markFollowUpNoResponse(Number(body.id));

      return NextResponse.json({
        success: true,
      });
    }

    /*
    * Normal follow-up edit.
    */
    if (!body.follow_up_date || !body.status) {
      return NextResponse.json(
        {
          error:
            "Follow-up date and status are required.",
        },
        { status: 400 },
      );
    }

    const validStatuses = [
      "Planned",
      "Sent",
      "Cancelled",
    ];

    const validResponseStatuses = [
      "Waiting",
      "Received",
      "No Response",
    ];

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid follow-up status." },
        { status: 400 },
      );
    }

    if (
      !validResponseStatuses.includes(
        body.response_status,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid response status." },
        { status: 400 },
      );
    }

    updateFollowUp(Number(body.id), {
      follow_up_date: body.follow_up_date,
      status: body.status,
      response_status: body.response_status,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update follow-up." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Follow-up ID is required." },
        { status: 400 },
      );
    }

    deleteFollowUp(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete follow-up." },
      { status: 500 },
    );
  }
}