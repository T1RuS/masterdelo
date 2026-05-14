"""add social links, is_admin, tax_rate to users

Revision ID: 004
Revises: 003
Create Date: 2026-05-14
"""
from typing import Union
from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("telegram", sa.String(100), nullable=True))
        batch_op.add_column(sa.Column("vk", sa.String(100), nullable=True))
        batch_op.add_column(sa.Column("max_messenger", sa.String(100), nullable=True))
        batch_op.add_column(sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("tax_rate", sa.Float(), nullable=False, server_default="4.0"))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("telegram")
        batch_op.drop_column("vk")
        batch_op.drop_column("max_messenger")
        batch_op.drop_column("is_admin")
        batch_op.drop_column("tax_rate")
