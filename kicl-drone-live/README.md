# KICL Drone Live Streaming — Development release v0.2

Kothari Industrial Corporation Limited (KICL) private drone video monitoring web application.

**Status:** source committed, deployment and drone interoperability not yet verified. Do not use for operational decisions until end-to-end acceptance tests pass.

## Stack / capabilities
- **MediaMTX** server: RTMP live ingest; HLS delivery; up to 7 days of rolling fMP4 recording on a persistent Docker volume.
- **FastAPI**: HTTP Basic authentication and stream-status API; protected HLS proxy.
- **React/Vite** dashboard: login, responsive player, drone dropdown, online status, periodic refresh.
- **Caddy**: automatic HTTPS certificates when `SITE_ADDRESS` has working DNS.
- **Docker Compose**: cloud/server deployment and restart policies.
- **GitHub Actions**: static Python checks and build of frontend assets.

## Install on a Linux VPS
1. Create an A/AAAA record for your chosen hostname pointing at your VPS.
2. On VPS, install Docker Engine + Docker Compose.
3. Clone this repository's `kicl-drone-streaming-mvp` branch and change into `kicl-drone-live`.
4. `cp .env.example .env`
5. Set `SITE_ADDRESS=stream.example.com` (your actual domain) and replace **both** placeholder passwords with strong different random values. Use `chmod 600 .env`.
6. Set firewall to allow inbound TCP 80/443, and TCP 1935 *only from your approved publisher address where feasible*. Never expose the private MediaMTX API or HLS origin.
7. Start: `docker compose up -d --build`
8. Confirm: `docker compose ps`, `docker compose logs --tail=100`.
9. Access `https://YOUR_DOMAIN` on mobile data (not the publisher's local Wi-Fi). Sign in using VIEWER_USER/VIEWER_PASSWORD.
10. Local-only testing: SITE_ADDRESS=localhost; browser `https://localhost` may require accepting a local certificate. Internet access needs working DNS and trusted TLS.

## Synthetic video publishing
On a separate machine with FFmpeg and internet, publish test video:
```sh
ffmpeg -re -f lavfi -i testsrc2=size=1280x720:rate=25 -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 50 -f flv "rtmp://SERVER_HOST:1935/drone1?user=publisher&pass=YOUR_PUBLISH_PASSWORD"
```
Set `PUBLISH_USER=publisher` unless you change the username in MediaMTX environment mapping. In the dashboard select `drone1`; status refreshes automatically.

## DJI Matrice 4T / 4E
The exact drone, controller, DJI Pilot 2 software and firmware must be checked for RTMP / supported Cloud API publishing. If supported, configure the controller stream endpoint to `rtmp://SERVER_HOST:1935/drone1` with the publishing credentials in the mechanism supported by the controller. A separate bridge may be required; **do not assume a DJI device accepts query-string credentials**.

## Security and release limitations
- **Not production-certified:** test authentication, browser compatibility, resource usage, latency, failover and drone connection in a controlled environment.
- HLS runs through HTTPS with an authenticated API proxy, but browser credentials are kept only in memory. Current MVP uses one shared viewer login rather than per-user RBAC and has no audit logs.
- RTMP ingest on TCP 1935 is **unencrypted**. For deployment over untrusted networks, terminate RTMPS with a supported proxy or use a VPN; restrict the port at firewall until secured.
- Safari/iOS native HLS auth is not yet implemented; Chrome/Firefox testing is recommended.
- MediaMTX recording is stored in a Docker volume and automatically deleted after 7 days. Files are not yet downloadable through the dashboard.
- The API does not directly expose the MediaMTX admin API on the public network.
- `SITE_ADDRESS` must be a hostname for trusted automatic public TLS.
- Playback is HLS and typically has seconds of latency; WebRTC/TURN requires later integration.
- No drone control commands are offered by this application.

## Acceptance checklist
- [ ] Docker Compose services healthy and frontend loads with HTTPS.
- [ ] Incorrect credentials rejected; correct viewer login accepted.
- [ ] FFmpeg publishes from external network; correct stream becomes Online.
- [ ] Viewer opens from separate mobile/cellular network.
- [ ] Stream switching works for two independent publishers.
- [ ] Recording saved in volume and 7-day retention confirmed.
- [ ] Public firewall blocks origin API ports and protects publisher.
- [ ] DJI Pilot 2 controller interoperability tested on actual Matrice 4T/4E.
