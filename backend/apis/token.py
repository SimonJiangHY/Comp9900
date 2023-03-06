from flask_restx import Resource, fields, Namespace, reqparse
from apis import db
from flask import jsonify, g
from apis.auth import basic_auth

api = Namespace('login',description="get login token")

@api.route("")
class GetToken(Resource):
    method_decorators = [basic_auth.login_required]

    @api.doc(description="http --auth 'YOUR EMAIL':'PASSWORD' POST http://localhost:5000/login")
    def post(self):
        token = g.current_user.get_jwt()
        g.current_user.ping()
        db.session.commit()
        return jsonify({'token': token,
                        'id': g.current_user.id})




