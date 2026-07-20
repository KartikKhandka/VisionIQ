"""add_auth_metadata

Revision ID: add_auth_metadata
Revises: d6ae5d0a2ebb
Create Date: 2026-07-11 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_auth_metadata'
down_revision: Union[str, None] = 'd6ae5d0a2ebb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table updates
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True))
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Refresh tokens (Session data) updates
    op.add_column('refresh_tokens', sa.Column('device_name', sa.String(), nullable=True))
    op.add_column('refresh_tokens', sa.Column('browser', sa.String(), nullable=True))
    op.add_column('refresh_tokens', sa.Column('operating_system', sa.String(), nullable=True))
    op.add_column('refresh_tokens', sa.Column('ip_address', sa.String(), nullable=True))
    op.add_column('refresh_tokens', sa.Column('user_agent', sa.String(), nullable=True))
    op.add_column('refresh_tokens', sa.Column('last_active_at', sa.String(), nullable=True))

    # Activity logs updates
    op.add_column('activity_logs', sa.Column('ip_address', sa.String(), nullable=True))
    op.add_column('activity_logs', sa.Column('user_agent', sa.String(), nullable=True))
    op.add_column('activity_logs', sa.Column('device_info', sa.String(), nullable=True))


def downgrade() -> None:
    # Activity logs
    op.drop_column('activity_logs', 'device_info')
    op.drop_column('activity_logs', 'user_agent')
    op.drop_column('activity_logs', 'ip_address')

    # Refresh tokens
    op.drop_column('refresh_tokens', 'last_active_at')
    op.drop_column('refresh_tokens', 'user_agent')
    op.drop_column('refresh_tokens', 'ip_address')
    op.drop_column('refresh_tokens', 'operating_system')
    op.drop_column('refresh_tokens', 'browser')
    op.drop_column('refresh_tokens', 'device_name')

    # Users
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'username')
