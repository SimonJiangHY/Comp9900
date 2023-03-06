from flask_restx import Resource, fields, Namespace, reqparse
from flask import request,g
from apis import db
from apis.models import User
from utils import registerValid
import re
from apis.auth import token_auth
from werkzeug import datastructures
import os

api = Namespace('users', description="user operations")


register_model = api.model("register",{
    "username": fields.String("Could only use alphabet and _"),
    "password": fields.String,
    "email": fields.String
})

edit_model = api.model("edit profile", {
    "username": fields.String("Could only use alphabet and _"),
    "password": fields.String,
    "name": fields.String,
    "gender": fields.String("male or female"),
    "introduction": fields.String,
})


avatar_parser = reqparse.RequestParser()
avatar_parser.add_argument("avatar", required=True, type=datastructures.FileStorage, location='files')


@api.route("", endpoint='users')
class CreateUsers(Resource):

    @api.expect(register_model, validate=True)
    def post(self):
        '''register a new User -- No login required'''
        info = request.get_json()
        cur_name, cur_password, cur_email = info["username"],info["password"],info["email"]
        err_message = {}
        if User.query.filter_by(username=cur_name).first():
            err_message['username'] = "Duplicate username"
        if User.query.filter_by(email=cur_email).first():
            err_message['email'] = "Duplicate email"
        if err_message:
            return {'message':err_message},404
        else:
            if re.search(r"[^a-zA-Z_]",cur_name):
                err_message["username"] = "invalid character"
            if not registerValid.check_password_strength(cur_password):
                err_message["password"] = "password not strong enough"
            if not registerValid.check_email(cur_email):
                err_message['email'] = "invalid email account"

            if err_message:
                return {'message': err_message}, 404

        user = User()
        user.from_dict(info)
        db.session.add(user)
        db.session.commit()

        return user.to_dict(), 200


    def get(self):
        '''show User Lists(not finished)'''
        pass


@api.route("/<int:id>", endpoint='user')
class UsersProfile(Resource):
    method_decorators = [token_auth.login_required]
    def get(self, id):
        '''get User Profile'''
        user = User.query.get_or_404(id)
        data = user.to_dict()
        cur_user = g.current_user
        if id != cur_user.id:
            data['is_following'] = cur_user.check_subscribe(user)
        else:
            data['is_following'] = 'cur_user'
        return data

    def delete(self, id):
        '''delete User'''
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return {'message': "deleted successfully"}

    @api.doc(description="payload中保留想要删改的项即可，不需要改动的项可直接删除")
    @api.expect(edit_model)
    def patch(self, id):
        '''update User'''
        cur_user = g.current_user
        user = User.query.get_or_404(id)
        info = request.get_json()
        err_message = {}
        if cur_user.id != id:
            err_message["error"] = "you can't modify other user's profile"
            return {'message': err_message}, 404
        if "username" in info:
            if info["username"] != user.username and User.query.filter_by(username=info["username"]).first():
                err_message["username"] = "Please use another name"
            else:
                if re.search(r"[^a-zA-Z_]", info["username"]):
                    err_message["username"] = "invalid character"
        if "password" in info:
            if not registerValid.check_password_strength(info["password"]):
                err_message["password"] = "password not strong enough"

        if "gender" in info:
            if info["gender"] not in ['male', 'female']:
                err_message['gender'] = "gender should be male or female"

        if err_message:
            return {'message': err_message}, 404
        user.from_dict(info)
        db.session.commit()
        return user.to_dict(), 200


@api.route('/avatar')
class EditAvatar(Resource):
    method_decorators = [token_auth.login_required]

    @api.expect(avatar_parser)
    @api.doc(description="file will be save in static dir and front end can load image by URL")
    def post(self):
        '''upload a avatar for current user'''
        cur_avatar = request.files.get("avatar")
        file_name = cur_avatar.filename
        err_message = {}
        check = file_name.split(".")[-1]
        if check not in ["jpg", "jpeg", "png"]:
            err_message["file"] = "please provide image file: .jpg/.jpeg/.png"
            return {'message': err_message}, 404
        store_path = "apis/static/ava"
        if not os.path.exists(store_path):
            os.mkdir(store_path)
        cur_avatar_name = g.current_user.avatar
        if cur_avatar_name != "/static/ava/default.jpg":
            os.remove("apis/"+cur_avatar_name)
        new_file_name = f"avatar_{str(g.current_user.id)}_{file_name.split('.')[0]}.jpg"
        save_path = store_path + "/" + new_file_name
        cur_avatar.save(save_path)
        url = "static/ava/" + new_file_name
        info = {'avatar': url}
        g.current_user.from_dict(info)
        db.session.commit()
        return g.current_user.to_dict(), 200

    def get(self):
        '''get current user's avatar url'''
        cur_user = g.current_user
        return {'url': cur_user.avatar}, 200



