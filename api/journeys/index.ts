import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { requireAdmin } from "../../lib/auth";
import { JourneyServices } from "../../services/journey.services";
import { deleteFromStorage, extractFilePathFromUrl } from "../../lib/supabase";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const BUCKET_NAME = "journeys";

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

  try {
    // GET /api/journeys - Get all journeys (public)
    if (req.method === "GET") {
      const journeys = await JourneyServices.getAll();
      const normalizedJourneys = journeys.map((journey) => ({
        ...journey,
        cover_image: normalizeCoverImage(journey.cover_image),
      }));
      return res.status(200).json({ data: normalizedJourneys });
    }

    // POST /api/journeys - Create journey (admin only)
    if (req.method === "POST") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const { parseFormData } = await import("../../lib/parseFormData.js");
      const { uploadToStorage } = await import("../../lib/supabase.js");
      const { fields, file } = await parseFormData(req);

      if (!file) {
        return res.status(400).json({
          message: "Cover image wajib diupload",
        });
      }

      const { title, type, excerpt, year, order_index, content } = fields;

      if (!title || !type || !excerpt || !year || !order_index) {
        return res.status(400).json({
          message: "Field wajib belum lengkap",
        });
      }

      // Validate type
      if (!["Education", "Work", "Organization"].includes(type)) {
        return res.status(400).json({
          message: "Invalid type. Must be Education, Work, or Organization",
        });
      }

      // Upload to Supabase Storage
      const ext = file.filename.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const coverImageUrl = await uploadToStorage(
        BUCKET_NAME,
        fileName,
        file.buffer,
        file.mimetype
      );

      const newJourney = await JourneyServices.create({
        title,
        type: type as "Education" | "Work" | "Organization",
        excerpt,
        content,
        year: Number(year),
        order_index: Number(order_index),
        cover_image: coverImageUrl,
      });

      return res.status(201).json({ data: newJourney });
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