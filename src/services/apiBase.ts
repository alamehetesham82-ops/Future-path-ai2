// Central place that decides where API calls go.
//
// Local dev / same-origin deploys (Render, Railway, Cloud Run running server.ts):
//   leave VITE_API_BASE_URL unset -> calls stay relative ("/api/...") and hit
//   the same server that served the page.
//
// Vercel (frontend-only, static build):
//   set VITE_API_BASE_URL to the URL of the separately-hosted backend
//   (e.g. https://futurepath-backend.onrender.com) in Vercel's
//   Project Settings -> Environment Variables, then redeploy.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  // path is expected to start with "/", e.g. "/api/colleges/search"
  return `${API_BASE}${path}`;
}
