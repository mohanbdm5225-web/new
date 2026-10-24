# KICL Drone Live Streaming MVP

A first working baseline for Kothari Industrial Corporation Limited: RTMP video ingest with MediaMTX, FastAPI authentication/HLS gateway, and React browser dashboard. DJI Matrice 4T/4E integration **is not yet confirmed or tested**. Use a synthetic FFmpeg feed first.

## Architecture
Publisher (drone/FFmpeg) -> Internet -> MediaMTX RTMP (:1935) -> private HLS (:8888) -> FastAPI Basic-auth proxy -> React via Nginx.
Viewer and drone can use different internet networks.

## Prerequisites
- Linux VPS running Docker Engine and Docker Compose, or local Docker for testing.
- Public IP/hostname and inbound TCP 1935 for RTMP.
- HTTPS reverse proxy (such as Caddy) for internet-facing viewer access. **Do not expose port 8080 as HTTP publicly.**

## Run
1. Copy `.env.example` to `.env`; set strong unique `PUBLISH_PASSWORD` and `VIEWER_PASSWORD`.
2. Run `docker compose up -d --build`.
3. Open `http://127.0.0.1:8080` locally, sign in using the `.env` viewer credentials.
4. Publish a test stream with FFmpeg from another computer (replace values and avoid logging secrets):
   `ffmpeg -re -f lavfi -i testsrc2=size=1280x720:rate=25 -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 50 -f flv "rtmp://SERVER_IP:1935/drone1?user=publisher&pass=PUBLISH_PASSWORD"`
   If using `-re` with a live input, adjust arguments for your source.
5. Select `drone1` in dashboard. HLS playlist is `/api/hls/drone1/index.m3u8`, gated by viewer authentication.
6. For remote viewing, run a trusted HTTPS reverse proxy to `127.0.0.1:8080` on the VPS, use a DNS record and valid TLS certificate. Viewers open that HTTPS hostname from any network. Keep the Docker web binding on loopback only.

## DJI Matrice 4T / 4E
Verify exact controller firmware and Pilot 2 live-streaming capability. If the controller can publish RTMP, configure its server URL to point at the VPS and set `drone1` as its stream path. Otherwise implement a compatible bridge using the officially supported DJI interfaces. The RTMP URL accepts `user` and `pass` query parameters for MediaMTX authentication; protect credentials.

## Limits and hardening
- MVP is HLS (seconds of delay), **not WebRTC low-latency**.
- Browser test target is desktop/mobile Chromium/Firefox. Native Safari HLS credentials are not yet implemented.
- Passwords are used in memory in the browser; HTTPS is mandatory remotely. No password persistence.
- No cloud infrastructure has been provisioned. GitHub does not itself host the video service.
- No production readiness claim: implement rate limiting, per-user accounts, stream authorization, audit logging, TURN/WebRTC if needed, retention policies, backups, and monitoring before deployment.
- MediaMTX private HLS port must **not** be exposed from Docker.
- RTMP TCP 1935 is unauthenticated until a valid publisher login; TLS for ingest (RTMPS/VPN) is recommended for production.
- If controller cannot encode H.264/AAC compatible HLS, transcoding might be necessary.
