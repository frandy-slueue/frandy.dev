"""add section visibility to site_settings

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('section_about',    sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('site_settings', sa.Column('section_skills',   sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('site_settings', sa.Column('section_projects', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('site_settings', sa.Column('section_timeline', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('site_settings', sa.Column('section_contact',  sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('site_settings', 'section_contact')
    op.drop_column('site_settings', 'section_timeline')
    op.drop_column('site_settings', 'section_projects')
    op.drop_column('site_settings', 'section_skills')
    op.drop_column('site_settings', 'section_about')
