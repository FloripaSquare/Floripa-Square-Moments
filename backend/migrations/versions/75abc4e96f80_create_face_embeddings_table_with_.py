"""create face_embeddings table with pgvector"""

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revisões Alembic
revision = '75abc4e96f80'
down_revision = '9c5ab395964f'
branch_labels = None
depends_on = None

def upgrade():
    # criar extensão pgvector, se ainda não existir
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # criar tabela
    op.create_table(
        "face_embeddings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("event_slug", sa.String, nullable=False),
        sa.Column("external_id", sa.String, nullable=False),
        sa.Column("embedding", Vector(512), nullable=False),  # 512 dimensões da embedding
        sa.Column("created_at", sa.DateTime, server_default=sa.text("now()")),
    )

    # criar índice ANN
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_face_embeddings_event_embedding
        ON face_embeddings
        USING ivfflat (embedding vector_l2_ops)
        WITH (lists = 100);
        """
    )

def downgrade():
    op.drop_index("idx_face_embeddings_event_embedding", table_name="face_embeddings")
    op.drop_table("face_embeddings")
