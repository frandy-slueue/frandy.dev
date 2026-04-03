"""add theme_mode to site_settings

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-04-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision      = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on    = None

def upgrade() -> None:
    op.add_column('site_settings',
        sa.Column('theme_mode', sa.String(10), nullable=False, server_default='dark')
    )

def downgrade() -> None:
    op.drop_column('site_settings', 'theme_mode')
