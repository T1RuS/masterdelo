"""add tax_regime and consent fields to users

Revision ID: 005
Revises: 004
Create Date: 2026-05-14
"""
from typing import Union
from alembic import op
import sqlalchemy as sa

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("tax_regime", sa.String(10), nullable=True))
        batch_op.add_column(sa.Column("consent_offer", sa.Boolean(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("consent_offer_date", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("consent_pd", sa.Boolean(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("consent_pd_date", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("consent_ip", sa.String(45), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("tax_regime")
        batch_op.drop_column("consent_offer")
        batch_op.drop_column("consent_offer_date")
        batch_op.drop_column("consent_pd")
        batch_op.drop_column("consent_pd_date")
        batch_op.drop_column("consent_ip")
