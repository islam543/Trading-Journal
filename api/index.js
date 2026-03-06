import app from "../server.js";

// Vercel serverless adapter for Express 5
export default function handler(req, res) {
  return app(req, res);
}
