import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");
const archiveDir = path.join(uploadDir, "archive");
const metadataFile = path.join(uploadDir, "metadata.json");

function ensureFolders() {
  if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });

  if (!fs.existsSync(archiveDir))
    fs.mkdirSync(archiveDir, { recursive: true });

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

function saveMetadata(data: any) {
  fs.writeFileSync(
    metadataFile,
    JSON.stringify(data, null, 2)
  );
}

function timestamp() {
  const d = new Date();

  return `${d.getFullYear()}${String(
    d.getMonth() + 1
  ).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}_${String(
    d.getHours()
  ).padStart(2, "0")}${String(
    d.getMinutes()
  ).padStart(2, "0")}${String(
    d.getSeconds()
  ).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    ensureFolders();

    const { file } = await req.json();

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "File name required",
        },
        {
          status: 400,
        }
      );
    }

    const metadata = readMetadata();

    const archiveFile = path.join(
      archiveDir,
      file
    );

    if (!fs.existsSync(archiveFile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Archive file not found",
        },
        {
          status: 404,
        }
      );
    }
        /* Archive current active file */

    if (metadata.active) {

      const current = path.join(
        uploadDir,
        metadata.active
      );

      if (fs.existsSync(current)) {

        fs.renameSync(
          current,
          path.join(
            archiveDir,
            `${timestamp()}_${metadata.active}`
          )
        );

      }

    }

    /* Restore selected archive */

    const restoredName = `active_${timestamp()}.xlsx`;

    fs.renameSync(
      archiveFile,
      path.join(
        uploadDir,
        restoredName
      )
    );

    metadata.active = restoredName;

    metadata.lastUpload =
      new Date().toISOString();

    saveMetadata(metadata);

    return NextResponse.json({

      success: true,

      active: restoredName

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