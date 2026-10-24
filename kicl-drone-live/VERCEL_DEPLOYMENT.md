# KICL Drone Live — Vercel deployment

## Important: deploy as a separate Vercel project
The GitHub repository contains an unrelated Next.js application at the repository root. **Do not change the root Next.js project settings** to deploy the drone app. Create a separate Vercel project importing `mohanbdm5225-web/new` and use:
- Git production branch: `kicl-drone-streaming-mvp`
- Root directory: `kicl-drone-live/web`
- Framework preset: Vite
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`

The web/vercel.json file supplies Vite build settings and SPA fallback.

## Backend is NOT hosted by Vercel
This only deploys the React UI. The FastAPI and MediaMTX services are persistent infrastructure requiring a VPS or comparable hosting. The frontend currently requests relative `/api/...` URLs, and **these calls will not work on Vercel until routed to the deployed FastAPI backend**.

For initial Vercel UI preview, the login will not work without the API.

## Verify failure
Check Vercel project -> Deployments -> build logs. Verify repository, branch, root directory and project identity. If Vercel is targeting the repository root it will build the unrelated Next.js app. A failure in that project must be diagnosed separately.

## Production checklist
- Dedicated separate Vercel project for frontend
- Public HTTPS endpoint for FastAPI
- Proxy /api to FastAPI via a controlled gateway, or implement a correctly secured cross-origin API client
- Configure valid stream URL and approved DJI/FFmpeg RTMP ingest on the VPS
- Validate browser compatibility, login and recording before production use
