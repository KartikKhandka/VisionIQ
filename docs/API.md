# API Design

Below is the planned REST API for VisionIQ.

## Authentication
- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/login`: Authenticate and receive JWT tokens.
- `POST /api/v1/auth/refresh`: Refresh JWT token.

## Scans & AI Processing
- `POST /api/v1/scans`: Upload an image of an appliance to start processing. Returns a `scan_id`.
- `GET /api/v1/scans/{scan_id}`: Get the status and result of a scan (Appliance, Brand, Model, OCR texts).

## Products & Knowledge Base
- `GET /api/v1/products/{product_id}`: Get details of a detected product.
- `GET /api/v1/products/{product_id}/manuals`: Retrieve associated manuals.
- `GET /api/v1/products/{product_id}/specifications`: Retrieve product specifications.

## AI Chat
- `POST /api/v1/chat/sessions`: Create a new chat session for a specific product/scan.
- `GET /api/v1/chat/sessions`: List history of user chat sessions.
- `POST /api/v1/chat/sessions/{session_id}/messages`: Send a message to the AI and receive a response.
- `GET /api/v1/chat/sessions/{session_id}/messages`: Retrieve chat history for a session.

## User
- `GET /api/v1/users/me`: Get current user profile.
- `PUT /api/v1/users/me`: Update user settings.
- `GET /api/v1/users/activity`: Get user activity logs.
