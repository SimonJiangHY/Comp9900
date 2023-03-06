"""add intro to user

Revision ID: c8f856bc4e7d
Revises: 4327ec17993b
Create Date: 2022-10-31 18:35:34.535524

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c8f856bc4e7d'
down_revision = '4327ec17993b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('introduction', sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'introduction')
    # ### end Alembic commands ###