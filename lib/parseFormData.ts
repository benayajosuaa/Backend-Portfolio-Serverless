import type { VercelRequest } from "@vercel/node";
import formidable from "formidable";
import { IncomingMessage } from "http";

export interface ParsedFormData {
  fields: { [key: string]: string };
  file?: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
  };
}

export async function parseFormData(req: VercelRequest): Promise<ParsedFormData> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    // Cast req to IncomingMessage for formidable
    form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Convert fields to simple object
      const parsedFields: { [key: string]: string } = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          parsedFields[key] = Array.isArray(value) ? (value[0] || "") : String(value);
        }
      }

      // Handle file if present (support multiple field names)
      const fileField =
        files.cover_image ||
        // Common camelCase variant from frontend
        (files as Record<string, any>).coverImage ||
        // Fallback to first file if field name differs
        Object.values(files)[0];
      let fileData: ParsedFormData["file"] = undefined;

      if (fileField) {
        const file = Array.isArray(fileField) ? fileField[0] : fileField;
        if (file) {
          const fs = await import("fs/promises");
          const buffer = await fs.readFile(file.filepath);
          fileData = {
            buffer,
            filename: file.originalFilename || "upload",
            mimetype: file.mimetype || "application/octet-stream",
          };
          // Clean up temp file
          await fs.unlink(file.filepath).catch(() => {});
        }
      }

      resolve({
        fields: parsedFields,
        file: fileData,
      });
    });
  });
}
