from fastapi import APIRouter

router = APIRouter()

@router.get("/{product_id}")
def get_product(product_id: str):
    return {"product_id": product_id, "model_number": "DUMMY-123"}

@router.get("/{product_id}/manuals")
def get_product_manuals(product_id: str):
    return [{"title": "User Manual", "file_url": "dummy_url"}]

@router.get("/{product_id}/specifications")
def get_product_specs(product_id: str):
    return [{"key": "Weight", "value": "50kg"}]
