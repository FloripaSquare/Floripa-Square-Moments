"""merge heads

Revision ID: c9d6ba55d07a
Revises: 75abc4e96f80, eab938f0f1ae
Create Date: 2025-09-23 02:17:06.830962+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9d6ba55d07a'
down_revision: Union[str, None] = ('75abc4e96f80', 'eab938f0f1ae')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
