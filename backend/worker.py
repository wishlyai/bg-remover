import os
from celery import Celery
from PIL import Image

from config import REDIS_URL, RESULT_DIR, REMBG_MODEL

celery_app = Celery("bg_remover", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    result_expires=3600,
    worker_prefetch_multiplier=1,  # process one job at a time per worker
)

# Load model once when the worker process starts (not per task)
_session = None


def get_session():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session(REMBG_MODEL)
    return _session


@celery_app.task(bind=True, max_retries=2)
def process_image(self, job_id: str, input_path: str):
    os.makedirs(RESULT_DIR, exist_ok=True)
    result_path = os.path.join(RESULT_DIR, f"{job_id}.png")
    error_path = os.path.join(RESULT_DIR, f"{job_id}.error")

    try:
        from rembg import remove

        img = Image.open(input_path).convert("RGBA")
        output = remove(img, session=get_session())
        output.save(result_path, "PNG")

        # Clean up uploaded file
        try:
            os.remove(input_path)
        except FileNotFoundError:
            pass

    except Exception as exc:
        with open(error_path, "w") as f:
            f.write(str(exc))
        raise self.retry(exc=exc, countdown=5)
