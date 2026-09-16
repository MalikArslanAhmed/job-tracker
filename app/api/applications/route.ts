import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import db from "@/lib/db";
import {
  createApplication,
  updateApplication,
} from "@/lib/applications";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.company || !body.job_title) {
      return NextResponse.json(
        {
          error: "Company and job title are required.",
        },
        { status: 400 },
      );
    }

    const application = createApplication(body);

    return NextResponse.json(
      {
        success: true,
        id: application.lastInsertRowid,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create application.",
      },
      { status: 500 },
    );
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 },
      );
    }

    if (!body.company || !body.job_title) {
      return NextResponse.json(
        { error: "Company and job title are required." },
        { status: 400 },
      );
    }

    const oldApplication = db
      .prepare(
        `
        SELECT
          resume_file,
          cover_letter_file,
          job_description_file
        FROM applications
        WHERE id = ?
        `,
      )
      .get(Number(body.id)) as
      | {
        resume_file: string | null;
        cover_letter_file: string | null;
        job_description_file: string | null;
      }
      | undefined;

    if (!oldApplication) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const result = updateApplication(Number(body.id), body);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");

    const filePairs = [
      {
        oldFile: oldApplication.resume_file,
        newFile: body.resume_file,
      },
      {
        oldFile: oldApplication.cover_letter_file,
        newFile: body.cover_letter_file,
      },
      {
        oldFile: oldApplication.job_description_file,
        newFile: body.job_description_file,
      },
    ];

    for (const { oldFile, newFile } of filePairs) {
      if (
        oldFile &&
        newFile &&
        oldFile !== newFile
      ) {
        const oldFilePath = path.join(
          uploadDir,
          path.basename(oldFile),
        );

        try {
          await unlink(oldFilePath);
        } catch (error) {
          console.error(
            `Could not delete old file: ${oldFile}`,
            error,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update application." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 },
      );
    }

    const application = db
      .prepare(
        `
        SELECT
          resume_file,
          cover_letter_file,
          job_description_file
        FROM applications
        WHERE id = ?
        `,
      )
      .get(Number(body.id)) as
      | {
        resume_file: string | null;
        cover_letter_file: string | null;
        job_description_file: string | null;
      }
      | undefined;

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");

    const files = [
      application.resume_file,
      application.cover_letter_file,
      application.job_description_file,
    ];

    for (const fileName of files) {
      if (!fileName) {
        continue;
      }

      const filePath = path.join(uploadDir, path.basename(fileName));

      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Could not delete file: ${fileName}`, error);
      }
    }

    db.prepare("DELETE FROM applications WHERE id = ?").run(
      Number(body.id),
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete application." },
      { status: 500 },
    );
  }
}