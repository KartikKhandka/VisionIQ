from fastapi import APIRouter
from .v1 import auth, scans, products, chat, users, knowledge

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(scans.router, prefix="/scans", tags=["Scans"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
