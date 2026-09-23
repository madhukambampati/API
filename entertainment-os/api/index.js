// Vercel serverless entry point. Vercel's Node.js runtime calls this with (req, res) — the same
// shape as Node's http module — so it can reuse the exact same handler the local dev server uses.
//
// Read "Deploying to Vercel" in README.md before relying on this in production: a serverless
// function has no persistent disk and no shared memory across instances, so bookings, chat
// sessions and the live-data cache do NOT reliably survive between requests the way they do with
// `npm start`. It's fine for a demo/preview link; for the real thing, run it as the long-running
// process it's designed to be (Render, Railway, Fly.io, or any VPS).
import { ready, handleRequest } from '../src/app.js';

export default async function handler(req, res) {
  await ready;
  return handleRequest(req, res);
}
