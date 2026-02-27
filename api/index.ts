import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    message: "Portfolio API - Serverless",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      journeys: "/api/journeys/*",
      works: "/api/works/*",
      contact: "/api/contact/*",
    },
  });
}
