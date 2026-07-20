# VisionIQ Development Guide

This guide explains step-by-step how to add new features to the VisionIQ platform while adhering to the Clean Architecture standards.

## How to Create a New Module (e.g., `Brand`)

### 1. Database Model (`models/`)
Create the SQLAlchemy entity representation in `backend/models/product.py` (or a new file).
It must inherit from `BaseModel` (which provides `id` UUID and `deleted_at`).
```python
from models.base import BaseModel
from sqlalchemy import Column, String

class Brand(BaseModel):
    __tablename__ = "brands"
    name = Column(String, index=True, nullable=False)
```

### 2. Pydantic Schemas (`schemas/`)
Create validation schemas for the API in `backend/schemas/brand.py`.
```python
from pydantic import BaseModel, ConfigDict
import uuid

class BrandBase(BaseModel):
    name: str

class BrandCreate(BrandBase):
    pass

class BrandResponse(BrandBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
```

### 3. Repository (`repositories/`)
Create the database interaction layer in `backend/repositories/brand_repo.py`.
Inherit from `BaseRepository` to get free CRUD operations (`get_by_id`, `get_all`, `create`, `update`, `soft_delete`).
```python
from sqlalchemy.orm import Session
from models.product import Brand
from repositories.base import BaseRepository

class BrandRepository(BaseRepository[Brand]):
    def __init__(self, db: Session):
        super().__init__(Brand, db)
```

### 4. Service (`services/`)
Create the business logic layer in `backend/services/brand_service.py`. 
Never write raw DB queries here. Always call the Repository.
```python
from sqlalchemy.orm import Session
from repositories.brand_repo import BrandRepository
from schemas.brand import BrandCreate

class BrandService:
    def __init__(self, db: Session):
        self.brand_repo = BrandRepository(db)

    def create_brand(self, brand_in: BrandCreate):
        # Add business logic/validation here
        return self.brand_repo.create(brand_in.model_dump())
```

### 5. API Router (`api/v1/`)
Create the HTTP controller in `backend/api/v1/brands.py`.
Inject dependencies like `get_db` and `get_current_active_user`.
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from api.deps import get_current_active_user
from services.brand_service import BrandService
from schemas.brand import BrandCreate, BrandResponse

router = APIRouter()

@router.post("/", response_model=BrandResponse)
def create_brand(
    brand_in: BrandCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    service = BrandService(db)
    return service.create_brand(brand_in)
```
Don't forget to register the router in `backend/api/router.py`.

### 6. Frontend API Client (`services/`)
Add the endpoint to the Axios client in `frontend/services/api.ts` or create a specific hook in `frontend/hooks/useBrands.ts`.
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data;
    }
  });
};
```

### 7. Frontend UI (`app/`)
Create the React Page and consume the hook. Validate any forms using Zod and React Hook Form.

## Writing Migrations (Alembic - Upcoming)
Once Alembic is initialized, after changing a model in `models/`:
1. Run `alembic revision --autogenerate -m "Added brand table"`
2. Review the generated migration file.
3. Run `alembic upgrade head`.

