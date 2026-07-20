# Database Design

VisionIQ uses PostgreSQL with UUID primary keys and soft deletes (`deleted_at`).

## Tables

### Users & Roles
- **users**: `id` (UUID), `email`, `password_hash`, `full_name`, `role_id`, `created_at`, `updated_at`, `deleted_at`.
- **roles**: `id` (UUID), `name` (e.g., admin, user), `permissions`.
- **refresh_tokens**: `id` (UUID), `user_id`, `token`, `expires_at`, `revoked`.

### Knowledge Base
- **categories**: `id` (UUID), `name` (Washing Machine, Refrigerator, etc.).
- **brands**: `id` (UUID), `name`.
- **products**: `id` (UUID), `category_id`, `brand_id`, `model_number`, `description`.
- **manuals**: `id` (UUID), `product_id`, `title`, `file_url`, `language`.
- **specifications**: `id` (UUID), `product_id`, `key`, `value`.

### User Activity & AI
- **scans**: `id` (UUID), `user_id`, `image_url`, `status` (processing, completed, failed), `detected_category_id`, `detected_brand_id`, `detected_model_number`, `ocr_raw_text`, `created_at`.
- **chat_sessions**: `id` (UUID), `user_id`, `product_id` (nullable), `scan_id` (nullable), `title`, `created_at`.
- **messages**: `id` (UUID), `session_id`, `role` (user, ai), `content`, `created_at`.
- **activity_logs**: `id` (UUID), `user_id`, `action`, `resource`, `created_at`.
