import os, re, secrets
from urllib.parse import quote
import httpx
from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI(title="KICL Drone Live Streaming API")
security = HTTPBasic()
STREAMS = [s.strip() for s in os.getenv("STREAM_NAMES", "drone1").split(",") if re.fullmatch(r"[A-Za-z0-9_-]+", s.strip())]
ORIGIN = os.getenv("MEDIAMTX_HLS", "http://mediamtx:8888").rstrip("/")

def verify(credentials: HTTPBasicCredentials = Depends(security)):
    user = os.getenv("VIEWER_USER", "")
    password = os.getenv("VIEWER_PASSWORD", "")
    if not user or not password or not (
        secrets.compare_digest(credentials.username.encode(), user.encode()) and
        secrets.compare_digest(credentials.password.encode(), password.encode())
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials", headers={"WWW-Authenticate": "Basic"})
    return credentials.username

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "kicl-live"}

@app.get("/api/streams")
def streams(_: str = Depends(verify)):
    return {"streams": STREAMS}

@app.get("/api/hls/{stream}/{asset:path}")
async def media(stream: str, asset: str, _: str = Depends(verify)):
    if stream not in STREAMS or not asset or ".." in asset or not re.fullmatch(r"[a-zA-Z0-9_./-]+", asset):
        raise HTTPException(status_code=404)
    # MediaMTX is private on the Docker network; only authenticated clients reach it.
    target = f"{ORIGIN}/{quote(stream, safe='')}/{asset}"
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=False) as client:
        try:
            upstream = await client.get(target)
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Streaming server unavailable")
    if upstream.status_code != 200:
        raise HTTPException(status_code=upstream.status_code, detail="Stream offline or not ready")
    content_type = upstream.headers.get("content-type", "application/octet-stream")
    return Response(upstream.content, media_type=content_type, headers={"Cache-Control": "no-store"})
