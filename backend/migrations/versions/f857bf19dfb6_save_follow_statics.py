"""save follow statics

Revision ID: f857bf19dfb6
Revises: df0aed02b0f0
Create Date: 2022-10-13 20:08:49.694844

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f857bf19dfb6'
down_revision = 'df0aed02b0f0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipe', sa.Column('view_num', sa.Integer(), nullable=True))
    op.add_column('recipe', sa.Column('like_num', sa.Integer(), nullable=True))
    op.add_column('recipe', sa.Column('comment_num', sa.Integer(), nullable=True))
    op.add_column('recipe', sa.Column('popular', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('following_num', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('follower_num', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'follower_num')
    op.drop_column('user', 'following_num')
    op.drop_column('recipe', 'popular')
    op.drop_column('recipe', 'comment_num')
    op.drop_column('recipe', 'like_num')
    op.drop_column('recipe', 'view_num')
    # ### end Alembic commands ###
