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
          lastUpload: null,
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

    return NextResponse.json({
      success: true,
      active: metadata.active,
      lastUpload: metadata.lastUpload ?? null,
      history: metadata.history ?? [],
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );

  }
}