import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

UPLOAD_DIR = "/tmp/bg_remover/uploads"
RESULT_DIR = "/tmp/bg_remover/results"

# Auto-delete files older than 1 hour (seconds)
FILE_TTL = 3600

# rembg model — birefnet-general is state of the art
REMBG_MODEL = os.getenv("REMBG_MODEL", "birefnet-general")

MAX_FILE_SIZE_MB = 20
