# Project Context: VisionIQ

## Project Vision
VisionIQ is an enterprise-grade AI-powered Visual Intelligence Platform designed to understand physical objects (currently restricted to Home Appliances: Washing Machine, Refrigerator, Air Conditioner, Microwave, Television, Dishwasher, Water Purifier). The system aims to detect appliances, identify models/brands, read labels via OCR, fetch manuals, and provide diagnostic assistance via an AI chatbot.

## Current Architecture
The project strictly adheres to **Clean Architecture**, **Domain Driven Design (DDD)**, and the **Repository Pattern**.
- **Presentation Layer**: FastAPI routers (Backend) & Next.js App Router (Frontend).
- **Application Layer**: Services containing all business logic.
- **Infrastructure Layer**: SQLAlchemy repositories mapping to Postgres.

## Technology Stack
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2, Pydantic v2, PostgreSQL, Redis, jose (JWT), passlib (bcrypt).
- **Frontend**: Next.js 14/15, React 18, TypeScript, Tailwind CSS, React Query, React Hook Form, Zod, Axios.
- **Infrastructure**: Docker, Docker Compose, GitHub Actions.

## Current Status
**Active Phase**: Phase 1 Completed. Phase 2 starting.
**Completed Features**:
1. Complete Project Scaffolding and Docker setup.
2. Database Models established (`User`, `Role`, `RefreshToken`, `Scan`, `ChatSession`, `Message`, `ActivityLog`, `PasswordResetToken`, `EmailVerificationToken`, `Category`, `Brand`, `Product`, `Manual`, `Specification`).
3. Complete Authentication Module (JWT, Bcrypt, Soft Deletes, Login, Register, Forgot Password, Reset Password, Logout, Profile update).

## Core Project Rules (Summary)
- **Strict Separation of Concerns**: Routers call Services; Services call Repositories.
- **No Boilerplate**: Repositories inherit from generic `BaseRepository`. Models inherit from `BaseModel` (UUID + Soft Delete).
- **Validation**: Strict validation matching between Pydantic (Backend) and Zod (Frontend).
- **State**: React Query handles all server state. Axios interceptors handle silent JWT refreshes.

## Current Models Overview
- `User`: Core identity, links to tokens and activity.
- `RefreshToken`, `PasswordResetToken`, `EmailVerificationToken`: Auth management.
- `ActivityLog`: System auditing.
- `Product`, `Brand`, `Category`, `Manual`, `Specification`: The core catalog for appliances.
- `Scan`, `ChatSession`, `Message`: The AI interaction history.

## Future Expansion Strategy
The system is built to scale modularly.
1. Add new models to `models/`.
2. Create standard Pydantic schemas in `schemas/`.
3. Create a repository extending `BaseRepository`.
4. Create a service implementing the domain logic.
5. Expose via a FastAPI router in `api/v1/`.
6. Consume via React Query in Next.js using Axios.

