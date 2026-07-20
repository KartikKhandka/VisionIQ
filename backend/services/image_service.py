import os
import uuid
import hashlib
from typing import Tuple, Dict, Any
from fastapi import UploadFile
from PIL import Image, ImageOps
import aiofiles

UPLOAD_DIR = "/app/uploads/images"
THUMBNAIL_DIR = "/app/uploads/thumbnails"
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class ImageService:
    def __init__(self):
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        os.makedirs(THUMBNAIL_DIR, exist_ok=True)

    async def validate_and_save(self, file: UploadFile) -> Dict[str, Any]:
        """Validates, saves the image, and extracts metadata."""
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise ValueError(f"Unsupported file type: {file.content_type}")
        
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise ValueError(f"File size exceeds 10MB limit")
            
        file_hash = hashlib.sha256(file_content).hexdigest()
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        
        # Generate safe UUID filename
        stored_filename = f"{uuid.uuid4()}.{ext}"
        storage_path = os.path.join(UPLOAD_DIR, stored_filename)
        
        # Save file asynchronously
        async with aiofiles.open(storage_path, "wb") as out_file:
            await out_file.write(file_content)
            
        # Extract metadata
        try:
            with Image.open(storage_path) as img:
                width, height = img.size
        except Exception as e:
            # Cleanup if invalid image
            os.remove(storage_path)
            raise ValueError(f"Invalid image file: {e}")

        return {
            "original_filename": file.filename,
            "stored_filename": stored_filename,
            "mime_type": file.content_type,
            "file_size": len(file_content),
            "width": width,
            "height": height,
            "storage_path": storage_path,
            "image_hash": file_hash
        }

    async def generate_thumbnails(self, stored_filename: str) -> Dict[str, str]:
        """Generates 128px and 512px thumbnails."""
        storage_path = os.path.join(UPLOAD_DIR, stored_filename)
        
        if not os.path.exists(storage_path):
            raise FileNotFoundError(f"Image {stored_filename} not found.")
            
        sizes = {"sm": 128, "md": 512}
        paths = {}
        
        with Image.open(storage_path) as img:
            # Correct orientation from EXIF
            img = ImageOps.exif_transpose(img)
            
            # Convert to RGB to ensure jpeg compatibility
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
                
            for label, size in sizes.items():
                img_copy = img.copy()
                img_copy.thumbnail((size, size))
                
                thumb_filename = f"{label}_{stored_filename}"
                thumb_path = os.path.join(THUMBNAIL_DIR, thumb_filename)
                
                img_copy.save(thumb_path, format="JPEG", quality=85)
                paths[f"thumbnail_{label}"] = thumb_path
                
        return paths
        
    def delete_files(self, stored_filename: str):
        """Deletes original and thumbnail files."""
        paths = [
            os.path.join(UPLOAD_DIR, stored_filename),
            os.path.join(THUMBNAIL_DIR, f"sm_{stored_filename}"),
            os.path.join(THUMBNAIL_DIR, f"md_{stored_filename}")
        ]
        for path in paths:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
