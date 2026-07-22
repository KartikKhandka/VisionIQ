from typing import List
import uuid
import os
from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from api.deps import get_current_active_user
from schemas.scan import ScanResponse
from services.scan_service import ScanService

router = APIRouter(
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        404: {"description": "Not Found"},
        500: {"description": "Internal Server Error"},
    }
)

@router.post(
    "/upload",
    response_model=ScanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and scan an image"
)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scan_service = ScanService(db)
    return await scan_service.process_upload(file, current_user.id, background_tasks)


@router.get(
    "",
    response_model=List[ScanResponse],
    summary="Get user scans"
)
def get_scans(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scan_service = ScanService(db)
    return scan_service.get_user_scans(current_user.id, skip, limit)


@router.get(
    "/{scan_id}",
    response_model=ScanResponse,
    summary="Get scan by ID"
)
def get_scan(
    scan_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scan_service = ScanService(db)
    scan = scan_service.get_scan(scan_id, current_user.id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.post(
    "/{scan_id}/retry",
    response_model=ScanResponse,
    summary="Retry a failed or delayed scan analysis"
)
async def retry_scan(
    scan_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scan_service = ScanService(db)
    return await scan_service.retry_analysis(scan_id, current_user.id)
@router.delete(
    "/{scan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete scan"
)
def delete_scan(
    scan_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scan_service = ScanService(db)
    scan_service.delete_scan(scan_id, current_user.id)
    return None


@router.get(
    "/{scan_id}/status",
    summary="Get scan status"
)
def get_scan_status(
    scan_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scan_service = ScanService(db)
    scan = scan_service.get_scan(scan_id, current_user.id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"status": scan.status}


@router.get(
    "/{scan_id}/thumbnail",
    summary="Get scan thumbnail"
)
def get_scan_thumbnail(
    scan_id: uuid.UUID,
    size: str = "sm",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if size not in ["sm", "md", "lg"]:
        raise HTTPException(status_code=400, detail="Size must be 'sm', 'md', or 'lg'")
        
    scan_service = ScanService(db)
    scan = scan_service.get_scan(scan_id, current_user.id)
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    if size == "lg":
        if scan.storage_path and os.path.exists(scan.storage_path):
            return FileResponse(scan.storage_path)
        raise HTTPException(status_code=404, detail="Image file not found")
        
    thumb_path = os.path.join("/app/uploads/thumbnails", f"{size}_{scan.stored_filename}")
    
    if not os.path.exists(thumb_path):
        if scan.storage_path and os.path.exists(scan.storage_path):
            return FileResponse(scan.storage_path)
        raise HTTPException(status_code=404, detail="Image file not found")
        
    return FileResponse(thumb_path)
