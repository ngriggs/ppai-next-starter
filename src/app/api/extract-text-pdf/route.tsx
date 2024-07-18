import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import PDFParser from "pdf2json";
import os from "os";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const uploadedFiles = formData.getAll("pdfFile");

  if (uploadedFiles.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const uploadedFile = uploadedFiles[0];

  if (!(uploadedFile instanceof File)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const tempDir = os.tmpdir();
  const tempFilePath = `${tempDir}/${uploadedFile.name}`;

  try {
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    const pdfParser = new PDFParser();

    const parsePromise = new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) =>
        reject(errData.parserError),
      );
      pdfParser.on("pdfParser_dataReady", () => {
        const parsedText = pdfParser.getRawTextContent();
        resolve(parsedText);
      });
    });

    pdfParser.loadPDF(tempFilePath);

    const parsedText = await parsePromise;

    // Clean up temporary file after parsing
    await fs.unlink(tempFilePath);

    return NextResponse.json({ extractedText: parsedText });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 },
    );
  }
}
