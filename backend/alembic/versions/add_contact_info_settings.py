"""add contact info to site_settings

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('contact_email', sa.String(255), nullable=True))
    op.add_column('site_settings', sa.Column('contact_phone', sa.String(50), nullable=True))
    op.add_column('site_settings', sa.Column('contact_whatsapp', sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'contact_whatsapp')
    op.drop_column('site_settings', 'contact_phone')
    op.drop_column('site_settings', 'contact_email')
