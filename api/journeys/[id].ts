import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { requireAdmin } from "../../lib/auth";
import { JourneyServices } from "../../services/journey.services";
import { parseFormData } from "../../lib/parseFormData";
import {
  uploadToStorage,
  deleteFromStorage,
  extractFilePathFromUrl,
} from "../../lib/supabase";
import crypto from "crypto";
import type { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

const BUCKET_NAME = "journeys";

function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (body.trim() === "") {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function normalizeCoverImage(coverImage: string): string {
  if (!coverImage) return coverImage;
  if (/^https?:\/\//i.test(coverImage)) {
    return coverImage;
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return coverImage;
  }
  if (coverImage.startsWith("/uploads/") || coverImage.startsWith("uploads/")) {
    const normalizedPath = coverImage.replace(/^\/?uploads\//, "");
    return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
  }
  if (!coverImage.startsWith("/")) {
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${coverImage}`;
  }
  if (coverImage.startsWith("/storage/")) {
    return `${supabaseUrl}${coverImage}`;
  }
  return coverImage;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS and preflight
  if (cors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const journeyId = Number(id);

  if (isNaN(journeyId)) {
    return res.status(400).json({ message: "id must be a number" });
  }

  try {
    // GET /api/journeys/[id] - Get journey by id (public)
    if (req.method === "GET") {
      const journey = await JourneyServices.getById(journeyId);
      if (!journey) {
        return res.status(404).json({ message: "Journey not found" });
      }
      // Normalize cover_image before sending
      const normalizedJourney = {
        ...journey,
        cover_image: normalizeCoverImage(journey.cover_image),
      };
      return res.status(200).json({ data: normalizedJourney });
    }

    // PUT /api/journeys/[id] - Update journey (admin only)
    if (req.method === "PUT") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const existing = await JourneyServices.getById(journeyId);
      if (!existing) {
        return res.status(404).json({ message: "Journey not found" });
      }

      const contentType = String(req.headers["content-type"] || "");
      let fields: Record<string, any> = {};
      let file: {
        buffer: Buffer;
        filename: string;
        mimetype: string;
      } | undefined;

      if (contentType.includes("multipart/form-data")) {
        const parsed = await parseFormData(req);
        fields = parsed.fields;
        file = parsed.file;
      } else {
        try {
          fields = await readJsonBody(req as unknown as IncomingMessage);
        } catch {
          return res.status(400).json({ message: "Invalid JSON body" });
        }
      }

      if (Object.keys(fields).length === 0 && !file) {
        return res.status(400).json({ message: "No data to update" });
      }

      const data: any = {
        title:
          typeof fields.title === "string" && fields.title !== ""
            ? fields.title
            : existing.title,
        type:
          typeof fields.type === "string" && fields.type !== ""
            ? fields.type
            : existing.type,
        excerpt:
          typeof fields.excerpt === "string" && fields.excerpt !== ""
            ? fields.excerpt
            : existing.excerpt,
        content:
          typeof fields.content !== "undefined"
            ? String(fields.content)
            : existing.content,
        year:
          typeof fields.year !== "undefined" && fields.year !== ""
            ? Number(fields.year)
            : existing.year,
        order_index:
          typeof fields.order_index !== "undefined" && fields.order_index !== ""
            ? Number(fields.order_index)
            : existing.order_index,
      };

      // Handle new image upload
      if (file) {
        // Delete old image from Supabase Storage
        if (existing.cover_image) {
          const oldPath = extractFilePathFromUrl(existing.cover_image, BUCKET_NAME);
          if (oldPath) {
            await deleteFromStorage(BUCKET_NAME, oldPath);
          }
        }

        // Upload new image
        const ext = file.filename.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        data.cover_image = await uploadToStorage(
          BUCKET_NAME,
          fileName,
          file.buffer,
          file.mimetype
        );
      }

      const updatedJourney = await JourneyServices.update(journeyId, data);
      // Normalize cover_image before sending
      const normalizedJourney = {
        ...updatedJourney,
        cover_image: normalizeCoverImage(updatedJourney.cover_image),
      };
      return res.status(200).json({ data: normalizedJourney });
    }

    // DELETE /api/journeys/[id] - Delete journey (admin only)
    if (req.method === "DELETE") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const existing = await JourneyServices.getById(journeyId);
      if (!existing) {
        return res.status(404).json({ message: "Journey not found" });
      }

      // Delete image from Supabase Storage
      if (existing.cover_image) {
        const filePath = extractFilePathFromUrl(existing.cover_image, BUCKET_NAME);
        if (filePath) {
          await deleteFromStorage(BUCKET_NAME, filePath);
        }
      }

      await JourneyServices.delete(journeyId);
      return res.status(200).json({ message: "Journey deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
