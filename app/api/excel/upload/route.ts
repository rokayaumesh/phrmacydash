import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");
const archiveDir = path.join(uploadDir, "archive");
const metadataFile = path.join(uploadDir, "metadata.json");

function ensureFolders() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
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

function saveMetadata(data: any) {
  fs.writeFileSync(
    metadataFile,
    JSON.stringify(data, null, 2)
  );
}

function timestamp() {
  const d = new Date();

  const y = d.getFullYear();

  const m = String(d.getMonth() + 1).padStart(2, "0");

  const day = String(d.getDate()).padStart(2, "0");

  const h = String(d.getHours()).padStart(2, "0");

  const min = String(d.getMinutes()).padStart(2, "0");

  const s = String(d.getSeconds()).padStart(2, "0");

  return `${y}${m}${day}_${h}${min}${s}`;
}

export async function POST(req: NextRequest) {
  try {
    ensureFolders();

    const form = await req.formData();

    const uploaded = form.get("file") as File;

    if (!uploaded) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const ext = path.extname(uploaded.name).toLowerCase();

    if (
      ext !== ".xlsx" &&
      ext !== ".xls"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only Excel files are allowed.",
        },
        {
          status: 400,
        }
      );
    }
        const bytes = await uploaded.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const metadata = readMetadata();

    /* -------------------------------
       Archive previous active file
    --------------------------------*/

    if (metadata.active) {

      const currentFile = path.join(
        uploadDir,
        metadata.active
      );

      if (fs.existsSync(currentFile)) {

        const archivedName =
          `${timestamp()}_${metadata.active}`;

        fs.renameSync(
          currentFile,
          path.join(
            archiveDir,
            archivedName
          )
        );

        metadata.history.unshift({
          file: archivedName,
          original: metadata.active,
          uploadedAt: new Date().toISOString()
        });

      }

    }

    /* -------------------------------
       Save new uploaded file
    --------------------------------*/

    const newFileName =
      `active_${timestamp()}${ext}`;

    const destination = path.join(
      uploadDir,
      newFileName
    );

    fs.writeFileSync(
      destination,
      buffer
    );

    metadata.active = newFileName;

    metadata.lastUpload = new Date().toISOString();

    saveMetadata(metadata);

    return NextResponse.json({

      success: true,

      filename: newFileName,

      uploadedAt: metadata.lastUpload

    });

  } catch (error: any) {

    console.error(error);

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