import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import get_settings

router = APIRouter(prefix="/uploads", tags=["uploads"])
settings = get_settings()

ALLOWED_CONTENT_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("/images")
def upload_image(file: UploadFile = File(...)):
    suffix = ALLOWED_CONTENT_TYPES.get(file.content_type or "")
    if suffix is None:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPEG, WEBP, and GIF images are supported",
        )

    media_root = Path(settings.media_root)
    image_dir = media_root / "images"
    image_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{suffix}"
    path = image_dir / filename

    with path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"{settings.media_url}/images/{filename}",
        "filename": filename,
        "content_type": file.content_type,
    }