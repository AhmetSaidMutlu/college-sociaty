/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import path from 'path';
import PDFParser from 'pdf2json';

async function parsePdf(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', () => {
      resolve((pdfParser as any).getRawTextContent());
    });

    pdfParser.loadPDF(filePath);
  });
}

function extractSpecificFields(rawText: string) {
  const result: Record<string, string> = {
    "finansal_durum": "kredi veya burs almıyor",
  };

  if (rawText.includes("öğrenim kredisi")) {
    result["finansal_durum"] = "öğrenim kredisi alıyor";
  } else if (rawText.includes("burs")) {
    result["finansal_durum"] = "burs alıyor";
  }

  return result;
}

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll('filepond');
  let fileName = '';
  let parsedText = '';

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile: any = uploadedFiles[1];

    if (uploadedFile) {
      fileName = uuidv4();
      const tempFilePath = path.join(os.tmpdir(), `${fileName}.pdf`);
      const fileBuffer: any = Buffer.from(await uploadedFile.arrayBuffer());

      try {
        await fs.writeFile(tempFilePath, fileBuffer);
        parsedText = await parsePdf(tempFilePath);
        console.log('Parsed text:', parsedText);
        // Usage
        const parsedFields = extractSpecificFields(parsedText);
        console.log('Extracted Fields:', parsedFields);
        return NextResponse.json(parsedFields);
      } catch (error) {
        console.error('Error processing the PDF:', error);
        return NextResponse.json({ error: 'Failed to process the PDF.' }, { status: 500 });
      } finally {
        await fs.unlink(tempFilePath);
      }
    } else {
      console.log('Uploaded file is not in the expected format.');
    }
  } else {
    console.log('No files found.');
  }

  const response = new NextResponse(parsedText);
  response.headers.set('FileName', fileName);
  return response;
}

