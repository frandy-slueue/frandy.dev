"""add contact status fields

Revision ID: 8a4b2c3d5e6f
Revises: 7f3a1b2c4d5e
Create Date: 2026-03-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '8a4b2c3d5e6f'
down_revision = '7f3a1b2c4d5e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('contacts', sa.Column('is_starred', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('contacts', sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('contacts', 'is_archived')
    op.drop_column('contacts', 'is_starred')
