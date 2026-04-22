import pdfParse from "pdf-parse";
import csvParser from "csv-parser";
import { Readable } from "stream";

const parseCsvBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(buffer)
      .pipe(csvParser())
      .on("data", (row) => rows.push(Object.values(row).join(" ")))
      .on("end", () => resolve(rows.join("\n")))
      .on("error", reject);
  });

export const extractTextFromFile = async (file) => {
  const mime = file.mimetype;

  if (mime === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/csv"
  ) {
    return parseCsvBuffer(file.buffer);
  }

  if (mime === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type");
};