"""add timestap to subscribe

Revision ID: 905dfdef57ec
Revises: f857bf19dfb6
Create Date: 2022-10-13 20:11:20.239578

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '905dfdef57ec'
down_revision = 'f857bf19dfb6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('subscribe', sa.Column('timestamp', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('subscribe', 'timestamp')
    # ### end Alembic commands ###
