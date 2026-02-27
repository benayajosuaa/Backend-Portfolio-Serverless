import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { requireAdmin } from "../../lib/auth";
import { WorkServices } from "../../services/work.services";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const BUCKET_NAME = "works";

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
    // GET /api/works - Get all works (public)
    if (req.method === "GET") {
      const works = await WorkServices.getAll();
      const normalizedWorks = works.map((work) => ({
        ...work,
        cover_image: normalizeCoverImage(work.cover_image),
      }));
      return res.status(200).json({
        message: "success to get all works",
        data: normalizedWorks,
      });
    }

    // POST /api/works - Create work (admin only)
    if (req.method === "POST") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const { parseFormData } = await import("../../lib/parseFormData.js");
      const { uploadToStorage } = await import("../../lib/supabase.js");
      const { fields, file } = await parseFormData(req);

      if (!file) {
        return res.status(400).json({
          message: "cover_image is required",
        });
      }

      const { title, excerpt, github_url, demo_url, drive_url, status, order_index } =
        fields;

      if (!title || !excerpt || !status || !order_index) {
        return res.status(400).json({
          message: "Required fields are missing",
        });
      }

      // Validate status
      if (!["Draft", "Published"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be Draft or Published",
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

      const newWork = await WorkServices.create({
        title,
        excerpt,
        cover_image: coverImageUrl,
        github_url: github_url || undefined,
        demo_url: demo_url || undefined,
        drive_url: drive_url || undefined,
        status: status as "Draft" | "Published",
        order_index: Number(order_index),
        published_at: status === "Published" ? new Date() : undefined,
      });

      return res.status(201).json({
        message: "success to create work",
        data: newWork,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
        SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      }
    });
  }
}
