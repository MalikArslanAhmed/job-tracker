import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be 10 MB or less." },
        { status: 400 },
      );
    }

    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          error: "Only PDF, DOC, and DOCX files are allowed.",
        },
        { status: 400 },
      );
    }

    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const fileName = `${Date.now()}-${baseName}${extension}`;

    const uploadDir = path.join(process.cwd(), "uploads");

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 },
    );
  }
}