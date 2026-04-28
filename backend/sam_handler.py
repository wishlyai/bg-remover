import os
from PIL import Image
from config import UPLOAD_DIR, RESULT_DIR


def run_sam(job_id: str, points: list, mode: str) -> str:
    """
    points: [{x: float, y: float, label: int}]  (normalized 0-1, label 1=fg 0=bg)
    mode:   'keep' | 'remove'
    Returns path to saved PNG.
    """
    try:
        import torch
        import numpy as np
        from segment_anything import sam_model_registry, SamPredictor
    except ImportError:
        raise RuntimeError(
            "SAM click modes require PyTorch + segment-anything. "
            "Only Auto Remove is available in this build."
        )

    os.makedirs(RESULT_DIR, exist_ok=True)

    # Find uploaded file
    input_path = None
    for fname in os.listdir(UPLOAD_DIR):
        if fname.startswith(job_id):
            input_path = os.path.join(UPLOAD_DIR, fname)
            break
    if not input_path:
        raise FileNotFoundError(f"No upload found for job {job_id}")

    img_pil = Image.open(input_path).convert("RGB")
    img_np = np.array(img_pil)
    h, w = img_np.shape[:2]

    # Load model (checkpoint downloaded via Dockerfile / startup script)
    model_type = os.getenv("SAM_MODEL_TYPE", "vit_b")
    checkpoint = os.getenv("SAM_CHECKPOINT", f"/models/sam_{model_type}.pth")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    sam = sam_model_registry[model_type](checkpoint=checkpoint)
    sam.to(device)

    predictor = SamPredictor(sam)
    predictor.set_image(img_np)

    coords = np.array([[p["x"] * w, p["y"] * h] for p in points], dtype=np.float32)
    labels = np.array([p["label"] for p in points], dtype=np.int32)

    # 'remove' mode: invert labels so clicked area becomes background
    if mode == "remove":
        labels = 1 - labels

    masks, scores, _ = predictor.predict(
        point_coords=coords,
        point_labels=labels,
        multimask_output=True,
    )
    best = masks[int(np.argmax(scores))]

    # Invert mask for 'remove' mode (keep everything except clicked region)
    if mode == "remove":
        best = ~best

    result = img_pil.convert("RGBA")
    alpha = Image.fromarray((best * 255).astype(np.uint8))
    result.putalpha(alpha)

    out_path = os.path.join(RESULT_DIR, f"{job_id}.png")
    result.save(out_path, "PNG")

    try:
        os.remove(input_path)
    except FileNotFoundError:
        pass

    return out_path
