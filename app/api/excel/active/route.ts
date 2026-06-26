import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");
const metadataFile = path.join(uploadDir, "metadata.json");

function ensureFolders() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
      recursive: true,
    });
  }

  if (!fs.existsSync(metadataFile)) {
    fs.writeFileSync(
      metadataFile,
      JSON.stringify(
        {
          active: "",
          history: [],
        },
        null,
        2
      )
    );
  }
}

function readMetadata() {
  ensureFolders();

  return JSON.parse(
    fs.readFileSync(metadataFile, "utf8")
  );
}

export async function GET() {
  try {
    const metadata = readMetadata();

    if (!metadata.active) {
      return new NextResponse(
        "No active Excel file found.",
        {
          status: 404,
        }
      );
    }

    const excelPath = path.join(
      uploadDir,
      metadata.active
    );

    if (!fs.existsSync(excelPath)) {
      return new NextResponse(
        "Active file missing.",
        {
          status: 404,
        }
      );
    }

    const buffer = fs.readFileSync(excelPath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          `inline; filename="${metadata.active}"`,

        "Cache-Control":
          "no-store"
      }
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      {
        status: 500
      }
    );

  }
}