import type { VercelRequest, VercelResponse } from "@vercel/node";

const allowedOrigins = [
  "http://localhost:3000",
  "https://portfolio-f-fawn.vercel.app/",
  "https://halobenaya.com",
  "https://www.halobenaya.com"
  // Tambahkan domain frontend lain jika ada
];

export function cors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || "";

  // Check if origin is allowed or if it's a development environment

  const isAllowed =
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    process.env.NODE_ENV === "development";

  // Untuk development/testing, fallback ke wildcard jika origin tidak terdaftar
  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV !== "production") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}
