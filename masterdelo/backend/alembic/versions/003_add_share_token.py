"""add share_token to orders

Revision ID: 003
Revises: 002
Create Date: 2026-05-14
"""
from typing import Union
from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("share_token", sa.String(36), nullable=True))
        batch_op.create_unique_constraint("uq_orders_share_token", ["share_token"])


def downgrade() -> None:
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_column("share_token")
