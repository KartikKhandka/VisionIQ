"""update vector dim to 768

Revision ID: a1b2c3d4e5f6
Revises: e8ebcb03dddc
Create Date: 2026-07-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'e8ebcb03dddc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Empty table because we cannot cast 384 dim vectors to 768 dim vectors directly
    op.execute("TRUNCATE TABLE knowledge_chunks CASCADE")
    op.execute("ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(768)")


def downgrade() -> None:
    op.execute("TRUNCATE TABLE knowledge_chunks CASCADE")
    op.execute("ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(384)")
