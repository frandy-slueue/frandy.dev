"""add docx and share url to site settings

Revision ID: g2h3i4j5k6l7
Revises: f6a7b8c9d0e1
Create Date: 2026-04-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'g2h3i4j5k6l7'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('resume_url_docx',  sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('resume_url_share', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'resume_url_share')
    op.drop_column('site_settings', 'resume_url_docx')
