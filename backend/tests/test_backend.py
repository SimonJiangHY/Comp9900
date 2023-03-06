import unittest
from tests import TestConfig
from apis import create_app, db
from flask import current_app
from apis.models import User
from base64 import b64encode
import json
from utils import registerValid,recipeVaild,popularCalculate


class BackEndTest(unittest.TestCase):
    # initial part
    # referred from web
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

    # referred from web
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # check if is in test mode
    def test_if_in_testing_config(self):
        self.assertTrue(current_app.config['TESTING'])

    def test_password_hash(self):
        new_user = User(username="Simon")
        new_user.set_password("Simon961113")
        true_result = "Simon961113"
        false_result = "123456"
        self.assertFalse(new_user.check_password(false_result))
        self.assertTrue(new_user.check_password(true_result))


#################################
#  check user related
#################################
    def make_token_auth_headers(self, email, password):
        headers = {
            'Authorization': f"Basic {b64encode((email + ':' + password).encode('utf-8')).decode('utf-8')}",
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        response = self.client.post('/login', headers=headers)
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        token = json_response['token']
        return {
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }


    def test_get_jwt_token(self):
        new_user = User(username="Simon", email="simon@gmail.com")
        new_user.set_password("Simon961113")
        db.session.add(new_user)
        db.session.commit()
        email = "simon@gmail.com"
        password = "Simon961113"
        basic_headers = {
            'Authorization': f"Basic {b64encode((email + ':' + password).encode('utf-8')).decode('utf-8')}",
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        response = self.client.post('/login', headers=basic_headers)
        self.assertEqual(response.status_code, 200)

    def test_api_need_auth_with_no_jwt(self):
        response = self.client.get('/follow/following_recipes')
        self.assertEqual(response.status_code, 401)

    def test_api_need_auth_with_jwt(self):
        new_user = User(username="Simon", email="simon@gmail.com")
        new_user.set_password("Simon961113")
        db.session.add(new_user)
        db.session.commit()
        headers = self.make_token_auth_headers("simon@gmail.com", "Simon961113")
        response = self.client.get('/users/avatar', headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_api_no_need_auth(self):
        response = self.client.get('/recipes?page=1&pagesize=10')
        self.assertEqual(response.status_code, 200)

    def test_password_strength(self):
        password = "123456"
        self.assertEqual(registerValid.check_password_strength(password), False)
        password = "Brainstorm9900"
        self.assertEqual(registerValid.check_password_strength(password), True)

    def test_enter_no_exist_api(self):
        response = self.client.get('/WTF')
        self.assertEqual(response.status_code, 404)

    def test_recipe_ingredient_structure(self):
        ingredient1 = "beef:50g, onion:100g"
        ingredient2 = "beef"
        self.assertEqual(recipeVaild.check_ingredient_detail(ingredient1), True)
        self.assertEqual(recipeVaild.check_ingredient_detail(ingredient2), False)

    def test_popular_formula(self):
        '''old recipe with good stats should have lower popular'''
        high = popularCalculate.get_popular(10, 100, 10, 10, 0)
        low = popularCalculate.get_popular(20, 400, 20, 20, 30)
        self.assertEqual(high > low, True)

    def test_self_user_profile_status(self):
        '''go to self user profile should respond cur_user'''
        user_1 = User(username="Simon", email="123@qq.com")
        user_1.set_password("Simon123")
        db.session.add(user_1)
        db.session.commit()
        header = self.make_token_auth_headers("123@qq.com", "Simon123")
        response = self.client.get('/users/1', headers=header)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response["is_following"], "cur_user")

    def test_unfollowed_user_profile_status(self):
        '''go to user main page you do not follow should respond False'''
        user_1 = User(username="Simon", email="123@qq.com")
        user_1.set_password("Simon123")
        user_2 = User(username="Jiang", email="456@qq.com")
        user_2.set_password("Simon123")
        db.session.add(user_1)
        db.session.add(user_2)
        db.session.commit()
        header = self.make_token_auth_headers("123@qq.com", "Simon123")
        response = self.client.get('/users/2', headers=header)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response["is_following"], False)

    def test_followed_user_profile_status(self):
        '''go to user main page you follow should respond True'''
        user_1 = User(username="Simon", email="123@qq.com")
        user_1.set_password("Simon123")
        user_2 = User(username="Jiang", email="456@qq.com")
        user_2.set_password("Simon123")
        db.session.add(user_1)
        db.session.add(user_2)
        db.session.commit()
        header = self.make_token_auth_headers("123@qq.com", "Simon123")
        self.client.get('follow/subscribe/2',headers=header)
        response = self.client.get('/users/2', headers=header)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response["is_following"], True)



