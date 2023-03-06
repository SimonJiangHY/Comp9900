from flask import g
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from apis import db
from apis.models import User
from flask import jsonify
from werkzeug.http import HTTP_STATUS_CODES


basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


def error_response(status_code, message=None):
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response


@basic_auth.verify_password
def verify_password(email, password):
    # login using your email and password
    user = User.query.filter_by(email=email).first()
    if user is None:
        return False
    g.current_user = user
    return user.check_password(password)


@basic_auth.error_handler
def basic_auth_error():
    return error_response(401)


@token_auth.verify_token
def verify_token(token):
    # check if token is true and in valid time
    g.current_user = User.verify_jwt(token) if token else None
    if g.current_user:
        # update last_seen by every time you check token
        g.current_user.ping()
        db.session.commit()
    return g.current_user is not None


@token_auth.error_handler
def token_auth_error():
    return error_response(401)
