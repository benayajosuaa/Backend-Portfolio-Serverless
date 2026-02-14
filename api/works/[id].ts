
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { requireAdmin } from "../../lib/auth";
import { WorkServices } from "../../services/work.services";
import { parseFormData } from "../../lib/parseFormData";
import {
  uploadToStorage,
  deleteFromStorage,
  extractFilePathFromUrl,
} from "../../lib/supabase";
import crypto from "crypto";



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

export const config = {
  api: {
    bodyParser: false,
  },
};

const BUCKET_NAME = "works";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS and preflight
  if (cors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(200).end();


  const { id } = req.query;
  const workId = Number(id);
  if (isNaN(workId)) {
    return res.status(400).json({ message: "id must be a number" });
  }

  try {
    // GET /api/works/[id] - Get work by id (public)
    if (req.method === "GET") {
      const work = await WorkServices.getById(workId);
      if (!work) {
        return res.status(404).json({ message: "work not found" });
      }
      // Normalize cover_image before sending
      const normalizedWork = {
        ...work,
        cover_image: normalizeCoverImage(work.cover_image),
      };
      return res.status(200).json({
        message: "success to get work by id",
        data: normalizedWork,
      });
    }

    // PUT /api/works/[id] - Update work (admin only)
    if (req.method === "PUT") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const existing = await WorkServices.getById(workId);
      if (!existing) {
        return res.status(404).json({ message: "work not found" });
      }

      const { fields, file } = await parseFormData(req);

      const data: any = {};

      if (fields.title) data.title = fields.title;
      if (fields.excerpt) data.excerpt = fields.excerpt;
      if (fields.status) data.status = fields.status;
      if (fields.order_index !== undefined) {
        data.order_index = Number(fields.order_index);
      }
      // Always update github_url, demo_url, drive_url (even if empty string)
      if (typeof fields.github_url !== "undefined") data.github_url = fields.github_url;
      if (typeof fields.demo_url !== "undefined") data.demo_url = fields.demo_url;
      if (typeof fields.drive_url !== "undefined") data.drive_url = fields.drive_url;

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

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          message: "no data to update",
        });
      }

      const updatedWork = await WorkServices.update(workId, data);
      // Normalize cover_image before sending
      const normalizedWork = {
        ...updatedWork,
        cover_image: normalizeCoverImage(updatedWork.cover_image),
      };
      return res.status(200).json({
        message: "success to update work",
        data: normalizedWork,
      });
    }

    // DELETE /api/works/[id] - Delete work (admin only)
    if (req.method === "DELETE") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const existing = await WorkServices.getById(workId);
      if (!existing) {
        return res.status(404).json({ message: "work not found" });
      }

      // Delete image from Supabase Storage
      if (existing.cover_image) {
        const filePath = extractFilePathFromUrl(existing.cover_image, BUCKET_NAME);
        if (filePath) {
          await deleteFromStorage(BUCKET_NAME, filePath);
        }
      }

      await WorkServices.delete(workId);
      return res.status(200).json({
        message: "success to delete work",
      });
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
