import os
import uuid
import time
import asyncio
import threading
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import aiofiles

from config import UPLOAD_DIR, RESULT_DIR, MAX_FILE_SIZE_MB, FILE_TTL

app = FastAPI(title="BGRemover API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)


# ── background cleanup thread ─────────────────────────────────
def _cleanup():
    while True:
        now = time.time()
        for d in [UPLOAD_DIR, RESULT_DIR]:
            for fname in os.listdir(d):
                fpath = os.path.join(d, fname)
                try:
                    if now - os.path.getmtime(fpath) > FILE_TTL:
                        os.remove(fpath)
                except FileNotFoundError:
                    pass
        time.sleep(300)

threading.Thread(target=_cleanup, daemon=True).start()


# ── upload ────────────────────────────────────────────────────
@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    mode: str = Form("auto"),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are accepted")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large (max {MAX_FILE_SIZE_MB} MB)")

    job_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "img.jpg")[1] or ".jpg"
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    async with aiofiles.open(input_path, "wb") as f:
        await f.write(content)

    # Auto mode: queue BiRefNet worker immediately
    if mode == "auto":
        from worker import process_image
        process_image.delay(job_id, input_path)

    # Click modes: just save the file — processing triggered by /segment/sam

    return {"job_id": job_id}


# ── SAM segmentation (click modes) ───────────────────────────
@app.post("/segment/sam")
async def segment_sam(request: Request):
    body = await request.json()
    job_id = body.get("job_id")
    points = body.get("points", [])
    mode = body.get("mode", "keep")

    if not job_id or not points:
        raise HTTPException(400, "job_id and points are required")

    loop = asyncio.get_event_loop()
    try:
        from sam_handler import run_sam
        await loop.run_in_executor(None, run_sam, job_id, points, mode)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        # Write error file so /status reports it
        with open(os.path.join(RESULT_DIR, f"{job_id}.error"), "w") as ef:
            ef.write(str(e))
        raise HTTPException(500, str(e))

    return {"status": "done", "job_id": job_id}


# ── status polling ────────────────────────────────────────────
@app.get("/status/{job_id}")
async def status(job_id: str):
    if os.path.exists(os.path.join(RESULT_DIR, f"{job_id}.png")):
        return {"status": "done"}
    error_path = os.path.join(RESULT_DIR, f"{job_id}.error")
    if os.path.exists(error_path):
        return {"status": "error", "message": open(error_path).read()}
    return {"status": "processing"}


# ── result download ───────────────────────────────────────────
@app.get("/result/{job_id}")
async def result(job_id: str):
    path = os.path.join(RESULT_DIR, f"{job_id}.png")
    if not os.path.exists(path):
        raise HTTPException(404, "Result not ready or already expired")
    return FileResponse(path, media_type="image/png", filename="background_removed.png")


# ── serve built React frontend ────────────────────────────────
_frontend = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_frontend):
    app.mount("/", StaticFiles(directory=_frontend, html=True), name="spa")
