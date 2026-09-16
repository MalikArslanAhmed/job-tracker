import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type RouteProps = {
    params: Promise<{
        filename: string;
    }>;
};

export async function GET(
    request: Request,
    { params }: RouteProps,
) {
    try {
        const { filename } = await params;

        const safeFilename = path.basename(filename);

        const filePath = path.join(
            process.cwd(),
            "uploads",
            safeFilename,
        );

        const file = await readFile(filePath);

        return new NextResponse(file, {
            headers: {
                "Content-Type": getContentType(safeFilename),
                "Content-Disposition": `inline; filename="${safeFilename}"`,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "File not found." },
            { status: 404 },
        );
    }
}

function getContentType(filename: string) {
    const extension = path.extname(filename).toLowerCase();

    if (extension === ".pdf") {
        return "application/pdf";
    }

    if (extension === ".doc") {
        return "application/msword";
    }

    if (extension === ".docx") {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    return "application/octet-stream";
}