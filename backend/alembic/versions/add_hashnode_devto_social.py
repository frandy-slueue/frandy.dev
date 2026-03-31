"""add hashnode and devto social links

Revision ID: a1b2c3d4e5f6
Revises: 9b5c3d4e6f7a
Create Date: 2026-04-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '9b5c3d4e6f7a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('social_hashnode', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('social_devto', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'social_devto')
    op.drop_column('site_settings', 'social_hashnode')
