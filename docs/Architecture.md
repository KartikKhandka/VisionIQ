# VisionIQ Architecture

VisionIQ is designed as a highly scalable AI SaaS application using Clean Architecture principles.

## Core Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2, Celery
- **Database**: PostgreSQL (relational data), Redis (caching and message broker)
- **Storage**: AWS S3 compatible object storage
- **AI Integration (Future)**: YOLO, PaddleOCR, LangGraph, Qdrant

## Clean Architecture (Backend)
The backend enforces strict separation of concerns:
- **Presentation (API)**: FastAPI routers and HTTP request/response handling.
- **Application (Services)**: Business logic, orchestrating calls between domains and infrastructure.
- **Domain (Models/Schemas)**: Core business entities (Users, Products, Scans) and validation logic (Pydantic).
- **Infrastructure (Repositories)**: Database operations, external API calls, third-party services.

## Feature-Sliced Design (Frontend)
The frontend organizes code by domain features rather than purely by technical type (e.g., `features/auth`, `features/scans`).
