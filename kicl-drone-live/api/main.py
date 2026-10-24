import os
import re
import secrets
import httpx
from urllib.parse import quote
from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import StreamingResponse

app = FastAPI(title="KICL Drone Live Streaming API", docs_url=None, redoc_url=None)
security = HTTPBasic()
ORIGIN = os.getenv("MEDIAMTX_HLS", "http://mediamtx:8888").rstrip("/")
MTX_API = os.getenv("MEDIAMTX_API", "http://mediamtx:9997").rstrip("/")
STREAMS = [s.strip() for s in os.getenv("STREAM_NAMES", "drone1").split(",") if re.fullmatch(r"[A-Za-z0-9_-]+", s.strip())]
SAFE_ASSET = re.compile(r"[a-zA-Z0-9_./-]+")

def verify(credentials: HTTPBasicCredentials = Depends(security)):
    username = os.getenv("VIEWER_USER", "")
    password = os.getenv("VIEWER_PASSWORD", "")
    if not username or not password or username.startswith("REPLACE_ME") or password.startswith("REPLACE_ME"):
        raise HTTPException(status_code=503, detail="Viewer credentials not configured")
    if not (secrets.compare_digest(credentials.username.encode(), username.encode()) and secrets.compare_digest(credentials.password.encode(), password.encode())):
        raise HTTPException(status_code=401, detail="Invalid credentials", headers={"WWW-Authenticate": "Basic realm=KICL"})
    return username

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "kicl-live"}

async def fetch_status():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{MTX_API}/v3/paths/list")
            r.raise_for_status()
            data = r.json()
            return {item.get("name"): item for item in data.get("items", [])}
    except (httpx.RequestError, httpx.HTTPStatusError, ValueError):
        return {}

@app.get("/api/streams")
async def streams(_: str = Depends(verify)):
    online = await fetch_status()
    return {"streams": [{"name": name, "online": bool(online.get(name, {}).get("ready")), "readers": online.get(name, {}).get("readers", 0)} for name in STREAMS]}

@app.get("/api/hls/{stream}/{asset:path}")
async def media(stream: str, asset: str, _: str = Depends(verify)):
    if stream not in STREAMS or not asset or asset.startswith("/") or ".." in asset or not SAFE_ASSET.fullmatch(asset):
        raise HTTPException(status_code=404)
    target = f"{ORIGIN}/{quote(stream, safe='')}/{asset}"
    client = httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0), follow_redirects=False)
    try:
        req = client.build_request("GET", target)
        upstream = await client.send(req, stream=True)
        if upstream.status_code != 200:
            await upstream.aclose()
            await client.aclose()
            raise HTTPException(status_code=404, detail="Stream offline")
        async def bytes_iter():
            try:
                async for chunk in upstream.aiter_bytes():
                    yield chunk
            finally:
                await upstream.aclose()
                await client.aclose()
        return StreamingResponse(bytes_iter(), media_type=upstream.headers.get("content-type", "application/octet-stream"), headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})
    except httpx.RequestError:
        await client.aclose()
        raise HTTPException(status_code=503, detail="Media server unavailable")
