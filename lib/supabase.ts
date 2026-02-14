import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase env vars are missing");
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

// Helper function to upload file to Supabase Storage
export async function uploadToStorage(
  bucket: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const { data, error } = await getSupabaseAdmin().storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

// Helper function to delete file from Supabase Storage
export async function deleteFromStorage(
  bucket: string,
  filePath: string
): Promise<void> {
  const { error } = await getSupabaseAdmin().storage.from(bucket).remove([filePath]);

  if (error) {
    console.error(`Delete failed: ${error.message}`);
  }
}

// Extract file path from public URL
export function extractFilePathFromUrl(publicUrl: string, bucket: string): string {
  if (!publicUrl) return "";

  const marker = `/storage/v1/object/public/${bucket}/`;

  if (publicUrl.startsWith("/uploads/") || publicUrl.startsWith("uploads/")) {
    return "";
  }

  const isHttpUrl =
    publicUrl.startsWith("http://") || publicUrl.startsWith("https://");

  if (!isHttpUrl) {
    if (publicUrl.includes(marker)) {
      return publicUrl.split(marker)[1] || "";
    }

    if (publicUrl.startsWith(`${bucket}/`)) {
      return publicUrl.slice(bucket.length + 1);
    }

    return publicUrl.replace(/^\/+/, "");
  }

  try {
    const url = new URL(publicUrl);
    const index = url.pathname.indexOf(marker);
    if (index >= 0) {
      return url.pathname.slice(index + marker.length);
    }
    return url.pathname.replace(/^\/+/, "");
  } catch {
    if (publicUrl.includes(marker)) {
      return publicUrl.split(marker)[1] || "";
    }

    if (publicUrl.startsWith(`${bucket}/`)) {
      return publicUrl.slice(bucket.length + 1);
    }

    return publicUrl.replace(/^\/+/, "");
  }
}
