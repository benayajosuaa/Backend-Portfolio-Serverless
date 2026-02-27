import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: "halobenaya API backend berhasil",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      journeys: "/api/journeys/*",
      works: "/api/works/*",
      contact: "/api/contact/*",
    },
  });
}
