from flask_restx import Resource, fields, Namespace, reqparse
from apis.auth import token_auth
from apis import db
from apis.models import Recipe
from werkzeug import datastructures
from flask import request, g
from utils import recipeVaild, sort
import os
from flask import url_for
from datetime import datetime,timedelta
from math import ceil

api = Namespace('recipes', description="recipes operations")

recipe_model = api.model("recipe", {
    "recipe_name": fields.String("enter a recipe name"),
    "meal_type": fields.String("select from ['Breakfast', 'Lunch', 'Dinner', 'Main', 'Drink', 'Snack'] 多选 逗号分隔"),
    "main_ingredients": fields.String("select from ['Beef','Vegetables','Pasta','Poultry','Pork','Seafood'] 多选 逗号分隔"),
    "ingredient_detail": fields.String("成分:用量,成分:用量, ..."),
    "method": fields.String("select from ['American','British','Chinese','Italian','Indian','French','other'] 单选"),
    "time": fields.String("selection: (Under 20 | Under 30 | Under 60 | Over 60) min 单选"),
    "description": fields.String
})

photo_parser = reqparse.RequestParser()
photo_parser.add_argument("photo", required=True, type=datastructures.FileStorage, location='files')

user_recipe_parser = reqparse.RequestParser()
user_recipe_parser.add_argument("id", required=True, type=int, location='args')
user_recipe_parser.add_argument("page", required=True, type=int, location='args')
user_recipe_parser.add_argument("pagesize", required=True, type=int, location='args')

recipe_parser = reqparse.RequestParser()
recipe_parser.add_argument("page", required=True, type=int, location='args')
recipe_parser.add_argument("pagesize", required=True, type=int, location='args')

@api.route("", endpoint='recipes')
class CreateRecipes(Resource):

    @token_auth.login_required
    @api.expect(recipe_model)
    @api.doc(
        description="创建食谱时 type ingredient method都需根据给定范围选择，ingredient可有多标签 筛选检测功能未完成")
    def post(self):
        '''create a new recipes(validation not done)'''
        info = request.get_json()
        err_message = {}
        check = ["recipe_name", "meal_type", "main_ingredients", "method", "time", "description", "ingredient_detail"]
        for item in check:
            if item not in info:
                err_message[item] = f"please provide {item}"
        if err_message:
            return {"message": err_message}, 404

        cur_type, cur_main_ingredients, cur_method, cur_time = info["meal_type"], info["main_ingredients"], \
                                                               info["method"], info["time"]
        cur_ingredient_detail = info["ingredient_detail"]
        if not recipeVaild.check_type(cur_type):
            err_message["meal_type"] = "please select from ['breakfast', 'lunch', 'dinner', 'main', 'drink', 'snack']"
        if not recipeVaild.check_time(cur_time):
            err_message["time"] = "please select from \
            ['under 10 min', 'under 20 min', 'under 30 min', 'under 60 min', 'over 60 min']"
        if not recipeVaild.check_ingredient(cur_main_ingredients):
            err_message["main_ingredients"] = "please give the right structure"

        if not recipeVaild.check_ingredient_detail(cur_ingredient_detail):
            err_message["ingredient_detail"] = "please give structure like -> ingredient:volume,ingredient:volume..."
        if not recipeVaild.check_method(cur_method):
            err_message["method"] = "error"

        if err_message:
            return {"message": err_message}, 404

        # 对mian_ingredients排序 再存储
        info['main_ingredients'] = sort.sort_items(info['main_ingredients'])

        info['meal_type'] = sort.sort_items(info['meal_type'])

        recipe = Recipe()
        recipe.from_dict(info)
        recipe.author = g.current_user
        db.session.add(recipe)
        db.session.commit()

        return recipe.to_dict(), 200

    @api.expect(recipe_parser)
    def get(self):
        '''show all recipes lists ordered by last modified time desc - no login required'''
        args = recipe_parser.parse_args()
        page = args['page']
        page_size = args['pagesize']
        tmp_list = Recipe.query.order_by(Recipe.last_modified.desc())
        recipe_num = tmp_list.count()
        page_number = recipe_num // page_size + 1
        start = page_size * (page - 1)
        end = start + page_size
        page_list = tmp_list.slice(start, end).all()

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "recipe_per_page": page_size,
                     "total_recipe_number": recipe_num}

        recipes = []
        for item in page_list:
            dic = {'recipe_id': item.id, 'author_id': item.author.id,
                   'recipe_name': item.recipe_name, 'photo': item.photo,
                   'last_modified': item.last_modified.strftime("%Y-%m-%d %H:%M"),
                   'views': item.view_num, 'likes': item.like_num, 'comments': item.comment_num,
                   'popular': item.popular,
                   'author': {
                              'id': item.author.id,
                              'username': item.author.username,
                              'email': item.author.email,
                              'avatar': item.author.avatar
                             },
                   'url': url_for('recipe', id=item.id)}
            recipes.append(dic)

        link = {'self': {'href': f"/recipes/?page={str(page)}&pagesize={str(page_size)}"}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f"/recipes/?page={str(page+1)}&pagesize={str(page_size)}"}
            elif page == page_number:
                link['previous'] = {'href': f"/recipes/?page={str(page-1)}&pagesize={str(page_size)}"}
            else:
                link['next'] = {'href': f"/recipes/?page={str(page+1)}&pagesize={str(page_size)}"}
                link['previous'] = {'href': f"/recipes/?page={str(page-1)}&pagesize={str(page_size)}"}

        if not recipes:
            return {'message': "no content this page"}

        return {'page_info': page_info,
                'recipes': recipes,
                '_links': link}, 200


@api.route("/<int:id>", endpoint='recipe')
class RecipesProfile(Resource):

    def get(self, id):
        '''get Recipe profile - no login required'''
        recipe = Recipe.query.get_or_404(id)
        recipe.view_num += 1
        # recipe.popular += 1
        data = recipe.to_dict()
        db.session.commit()
        return data

    @token_auth.login_required
    def delete(self, id):
        '''delete Recipe'''
        recipe = Recipe.query.get_or_404(id)
        cur_user = g.current_user
        err_message = {}
        if cur_user.id != recipe.author_id:
            err_message["user"] = "this recipe is not created by you, you can't modify it"
            return {'message': err_message}, 404
        # also need to delete the photo you save
        if recipe.photo is not None:
            path = "apis/" + recipe.photo
            os.remove(path)
        db.session.delete(recipe)
        db.session.commit()
        return {'message': "deleted successfully"}

    @token_auth.login_required
    @api.expect(recipe_model)
    def patch(self, id):
        '''update Recipe profile'''
        recipe = Recipe.query.get_or_404(id)
        cur_user = g.current_user
        info = request.get_json()
        err_message = {}
        # confirm the recipe is created by you
        if cur_user.id != recipe.author_id:
            err_message["user"] = "this recipe is not created by you, you can't modify it"
        if "recipe_name" in info:
            if info["recipe_name"] != recipe.recipe_name and Recipe.query.filter_by(
                    recipe_name=info["recipe_name"]).first():
                err_message["recipe_name"] = "please use another name"
        if "meal_type" in info:
            if not recipeVaild.check_type(info["meal_type"]):
                err_message[
                    "meal_type"] = "please select from ['breakfast', 'lunch', 'dinner', 'main', 'drink', 'snack']"
            else:
                info['meal_type'] = sort.sort_items(info['meal_type'])
        if "main_ingredients" in info:
            if not recipeVaild.check_ingredient(info["main_ingredients"]):
                err_message["main_ingredients"] = "please give the right structure"
            else:
                info['main_ingredients'] = sort.sort_items(info['main_ingredients'])
        if "method" in info:
            if not recipeVaild.check_method(info["method"]):
                err_message["method"] = "error"
        if "time" in info:
            if not recipeVaild.check_time(info["time"]):
                err_message["time"] = "please select from \
                ['under 10 min', 'under 20 min', 'under 30 min', 'under 60 min', 'over 60 min']"
        if "ingredient_detail" in info:
            if not recipeVaild.check_ingredient_detail(info["ingredient_detail"]):
                err_message[
                    "ingredient_detail"] = "please give structure like -> ingredient:volume,ingredient:volume..."

        if err_message:
            return {'message': err_message}, 404
        recipe.from_dict(info)
        recipe.last_modified = datetime.utcnow()
        db.session.commit()
        return recipe.to_dict(), 200


@api.route("/photo/<int:id>")
class UploadPhoto(Resource):

    @token_auth.login_required
    @api.expect(photo_parser)
    def post(self, id):
        '''upload a photo for the target recipe'''
        cur_recipe = Recipe.query.get_or_404(id)
        cur_photo = request.files.get("photo")
        file_name = cur_photo.filename
        cur_user = g.current_user
        err_message = {}
        if cur_user.id != cur_recipe.author_id:
            err_message["user"] = "this recipe is not created by you, you can't modify it"
        check = file_name.split(".")[-1]
        if check not in ["jpg", "jpeg", "png"]:
            err_message["file"] = "please provide image file: .jpg/.jpeg/.png"
        if err_message:
            return {'message': err_message}, 404
        store_path = "apis/static/recipe"
        if not os.path.exists(store_path):
            os.mkdir(store_path)
        new_file_name = f"photo_recipe_{cur_recipe.id}_{cur_recipe.recipe_name}.jpg"
        save_path = store_path + "/" + new_file_name
        cur_photo.save(save_path)
        url = "static/recipe/" + new_file_name
        info = {'photo': url}
        cur_recipe.from_dict(info)
        cur_recipe.last_modified = datetime.utcnow()
        db.session.commit()
        return cur_recipe.to_dict(), 200

    def get(self, id):
        '''get the photo curl'''
        cur_recipe = Recipe.query.get_or_404(id)
        return {'url': cur_recipe.photo}


@api.route("/user")
class UserRecipes(Resource):

    @api.expect(user_recipe_parser)
    def get(self):
        '''get recipe lists from a target user ordered by last modified time desc -- no login required'''
        args = user_recipe_parser.parse_args()
        page_size = args.get('pagesize')
        user_id = args.get('id')
        page = args.get('page')
        # get your recipe list ordered by last modified time by desc
        tmp_list = Recipe.query.filter_by(author_id=user_id).order_by(Recipe.last_modified.desc())
        recipe_num = tmp_list.count()
        page_number = ceil(recipe_num / page_size)
        start = page_size * (page - 1)
        end = start + page_size
        page_list = tmp_list.slice(start, end).all()
        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "recipe_per_page": page_size,
                     "total_recipe_number": recipe_num}

        recipes = []
        for item in page_list:
            dic = {'recipe_id': item.id, 'recipe_name': item.recipe_name, 'photo': item.photo,
                   'last_modified': item.last_modified.strftime("%Y-%m-%d %H:%M"),
                   'views': item.view_num, 'likes': item.like_num, 'comments': item.comment_num, 'popular': item.popular,
                   'url': url_for('recipe', id=item.id)}
            recipes.append(dic)

        link = {'self': {'href': f"/recipes/user?id={str(user_id)}&page={str(page)}&pagesize={str(page_size)}"}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f"/recipes/user?id={str(user_id)}&page={str(page+1)}&pagesize={str(page_size)}"}
            elif page == page_number:
                link['previous'] = {'href': f"/recipes/user?id={str(user_id)}&page={str(page-1)}&pagesize={str(page_size)}"}
            else:
                link['next'] = {'href': f"/recipes/user?id={str(user_id)}&page={str(page+1)}&pagesize={str(page_size)}"}
                link['previous'] = {'href': f"/recipes/user?id={str(user_id)}&page={str(page-1)}&pagesize={str(page_size)}"}

        if not recipes:
            return {'message': "no content this page"}

        return {'page_info': page_info,
                'author_id': user_id,
                'recipes': recipes,
                '_links': link}, 200



