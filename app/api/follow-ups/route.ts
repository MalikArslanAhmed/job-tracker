import { NextResponse } from "next/server";
import {
  createFollowUp,
  deleteFollowUp,
  getFollowUpsByApplicationId,
  updateFollowUp,
} from "@/lib/followUps";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = Number(
      searchParams.get("applicationId"),
    );

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 },
      );
    }

    const followUps =
      getFollowUpsByApplicationId(applicationId);

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
      body.status === "Completed"
        ? "Completed"
        : "Planned";

    const result = createFollowUp({
      application_id: Number(body.application_id),
      follow_up_date: body.follow_up_date,
      status,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create follow-up." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.id ||
      !body.follow_up_date ||
      !body.status
    ) {
      return NextResponse.json(
        {
          error:
            "Follow-up ID, date, and status are required.",
        },
        { status: 400 },
      );
    }

    if (
      body.status !== "Planned" &&
      body.status !== "Completed"
    ) {
      return NextResponse.json(
        { error: "Invalid follow-up status." },
        { status: 400 },
      );
    }

    updateFollowUp(Number(body.id), {
      follow_up_date: body.follow_up_date,
      status: body.status,
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