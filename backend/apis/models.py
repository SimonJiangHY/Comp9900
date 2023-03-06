from apis import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask import url_for, current_app
from datetime import datetime, timedelta
import jwt


subscribe = db.Table("subscribe",
                     db.Column("fan_id", db.Integer, db.ForeignKey("user.id")),
                     db.Column("contributor_id", db.Integer, db.ForeignKey("user.id")),
                     db.Column("timestamp", db.DateTime(), default=datetime.utcnow))

like = db.Table("like",
                db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
                db.Column("recipe_id", db.Integer, db.ForeignKey("recipe.id")),
                db.Column("timestamp", db.DateTime(), default=datetime.utcnow))

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(128), index=True, unique=True)
    # password will not be stored as texture info
    password_hash = db.Column(db.String(128))
    last_seen = db.Column(db.DateTime(), default=datetime.utcnow)
    avatar = db.Column(db.String(128), index=True, default="/static/ava/default.jpg")
    name = db.Column(db.String(64))
    gender = db.Column(db.String(64))
    introduction = db.Column(db.Text, default="Nice to see you!")
    following_num = db.Column(db.Integer, default=0)
    follower_num = db.Column(db.Integer, default=0)
    favourite_num = db.Column(db.Integer, default=0)
    recipes = db.relationship('Recipe', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    # self-reference relationship
    # object 'subscribed' will list the users you subscribed
    # object 'fans' will list the users who subscribe you
    subscribed = db.relationship('User', secondary=subscribe,
                                 primaryjoin=(subscribe.c.fan_id == id),
                                 secondaryjoin=(subscribe.c.contributor_id == id),
                                 backref=db.backref('fans', lazy='dynamic'), lazy='dynamic')

    comments = db.relationship('Comment', backref='author', lazy='dynamic',
                               cascade='all, delete-orphan')

    def __repr__(self):
        return '<User {}>'.format(self.id)

    def check_subscribe(self, user):
        check = self.subscribed.filter(subscribe.c.contributor_id == user.id).count()
        if check > 0:
            return True
        else:
            return False

    def subscribe_user(self, user):
        if not self.check_subscribe(user):
            self.subscribed.append(user)

    def unsubscribe_user(self, user):
        if self.check_subscribe(user):
            self.subscribed.remove(user)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'name': self.name,
            'gender': self.gender,
            'introduction': self.introduction,
            'following_num': self.following_num,
            'follower_num': self.follower_num,
            'favourite_num': self.favourite_num,
            '_links': {
                'self': url_for('user', id=self.id)
            }
        }
        return data

    def from_dict(self, data):
        for field in ['username', 'avatar', 'name', 'gender', 'email', 'introduction']:
            if field in data:
                setattr(self, field, data[field])
        if 'password' in data:
            self.set_password(data['password'])

    def ping(self):
        self.last_seen = datetime.utcnow()
        db.session.add(self)

    def get_jwt(self, expires_in=86400):
        now = datetime.utcnow()
        payload = {
            'user_id': self.id,
            'username': self.username,
            'exp': now + timedelta(seconds=expires_in),
            'iat': now
        }
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256')

    @staticmethod
    def verify_jwt(token):
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256'])
        except jwt.exceptions.ExpiredSignatureError as e:
            return None
        return User.query.get(payload.get('user_id'))


class Recipe(db.Model):
    __tablename__ = 'recipe'
    id = db.Column(db.Integer, primary_key=True)
    recipe_name = db.Column(db.String(255))
    last_modified = db.Column(db.DateTime(), index=True, default=datetime.utcnow)
    meal_type = db.Column(db.String(255))
    main_ingredients = db.Column(db.String(255))
    ingredient_detail = db.Column(db.String(255))
    method = db.Column(db.String(255))
    time = db.Column(db.String(255))
    photo = db.Column(db.String(255))
    description = db.Column(db.Text)
    # save the number of views,likes and comments
    view_num = db.Column(db.Integer, default=0)
    like_num = db.Column(db.Integer, default=0)
    comment_num = db.Column(db.Integer, default=0)
    # calculate how popular the recipe is :? forum -> popular = views + likes + comments
    popular = db.Column(db.Integer, default=0)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    # add comments
    comments = db.relationship('Comment', backref='recipe', lazy='dynamic',
                               cascade='all, delete-orphan')
    # add likes -> back ref (favourite) to User
    likes = db.relationship('User', secondary=like, backref=db.backref('favourite', lazy='dynamic'))

    def to_dict(self):
        data = {
            'recipe_id': self.id,
            'author_id': self.author_id,
            'recipe_name': self.recipe_name,
            'last_modified': self.last_modified.strftime("%Y-%m-%d %H:%M"),
            'views': self.view_num,
            'likes': self.like_num,
            'comments': self.comment_num,
            'popular': self.popular,
            'meal_type': self.meal_type,
            'main_ingredients': self.main_ingredients,
            'ingredient_detail': self.ingredient_detail,
            'method': self.method,
            'time': self.time,
            'photo': self.photo,
            'description': self.description,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
                'email': self.author.email,
                'avatar': self.author.avatar,
                'introduction': self.author.introduction
            },
            '_links': {
                'self': url_for('recipe', id=self.id),
                'author': url_for('user', id=self.author_id)
            }
        }
        return data

    def from_dict(self, data):
        for field in ["recipe_name", "meal_type", "main_ingredients", "method", "time", "description", "photo",
                      "ingredient_detail"]:
            if field in data:
                setattr(self, field, data[field])

    def check_like(self, user):
        if user in self.likes:
            return True
        else:
            return False

    def liked_by(self, user):
        if not self.check_like(user):
            self.likes.append(user)

    def unliked_by(self, user):
        if self.check_like(user):
            self.likes.remove(user)


class Comment(db.Model):
    __tablename__ = "comment"
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)
    timestamp = db.Column(db.DateTime(), default=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'))
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id', ondelete='CASCADE'))
    parent = db.relationship('Comment', backref=db.backref('children', cascade='all, delete-orphan'), remote_side=[id])

    def __repr__(self):
        return '<Comment {}>'.format(self.id)

    def to_dict(self):
        data = {
            'id': self.id,
            'content': self.content,
            'timestamp': self.timestamp.strftime("%Y-%m-%d %H:%M"),
            'parent_id': self.parent_id if self.parent else None,
            'comment_author': {
                'id': self.author.id,
                'username': self.author.username,
                'avatar': self.author.avatar
            },
            'recipe': {
                'id': self.recipe.id,
                'recipe_name': self.recipe.recipe_name,
                'author': self.recipe.author_id,
            },
            '_links': {
                'comment': url_for('comment', id=self.id),
                'recipe': url_for('recipe', id=self.recipe_id),
                'comment_author': url_for('user', id=self.author_id)
            }
        }

        return data

    def from_dict(self,data):
        for field in ['content', 'author_id', 'recipe_id', 'parent_id']:
            if field in data:
                setattr(self, field, data[field])

    def get_children(self):
        data = []

        def children(comment):
            if comment.children:
                for child in comment.children:
                    data.append(child)
                    children(child)
        children(self)
        return data





