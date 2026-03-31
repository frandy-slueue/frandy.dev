"""add social links to site_settings

Revision ID: 9b5c3d4e6f7a
Revises: 8a4b2c3d5e6f
Create Date: 2026-03-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '9b5c3d4e6f7a'
down_revision = '8a4b2c3d5e6f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('social_github', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('social_linkedin', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('social_x', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('social_facebook', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('social_medium', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'social_medium')
    op.drop_column('site_settings', 'social_facebook')
    op.drop_column('site_settings', 'social_x')
    op.drop_column('site_settings', 'social_linkedin')
    op.drop_column('site_settings', 'social_github')
