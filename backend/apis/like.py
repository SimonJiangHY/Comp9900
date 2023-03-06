from flask_restx import Resource, Namespace, reqparse
from flask import g, url_for
from apis import db
from apis.models import User, Recipe, subscribe, like
from apis.auth import token_auth
from math import ceil


api = Namespace('favourite', description="favourite operations")
page_args = reqparse.RequestParser()
page_args.add_argument("page", required=True, type=int, location='args')
page_args.add_argument("pagesize", required=True, type=int, location='args')


@api.route("/like/<int:id>")
class LikeRecipe(Resource):
    @token_auth.login_required
    def get(self,id):
        '''like a recipe'''
        cur_user = g.current_user
        cur_recipe = Recipe.query.get_or_404(id)
        err_message = {}
        if cur_recipe.check_like(cur_user):
            err_message['message'] = "already liked"
        if cur_user.id == cur_recipe.author_id:
            err_message['message'] = "you can't like your own recipes"
        if err_message:
            return err_message, 404
        cur_user.favourite_num += 1
        cur_recipe.like_num += 1
        cur_recipe.liked_by(cur_user)
        db.session.commit()

        return {'message': f'succeed, you have liked recipe {cur_recipe.id}'}, 200


@api.route("/unlike/<int:id>")
class UnlikeRecipe(Resource):
    @token_auth.login_required
    def get(self,id):
        '''unlike a recipe'''
        cur_user = g.current_user
        cur_recipe = Recipe.query.get_or_404(id)
        err_message = {}
        if not cur_recipe.check_like(cur_user):
            err_message['message'] = "have not liked yet"
        if cur_user.id == cur_recipe.author_id:
            err_message['message'] = "you can't unlike your own recipes"
        if err_message:
            return err_message, 404
        cur_user.favourite_num -= 1
        cur_recipe.like_num -= 1
        cur_recipe.unliked_by(cur_user)
        db.session.commit()

        return {'message': f'succeed, you have unliked recipe {cur_recipe.id}'}, 200



@api.route("/user/<int:id>")
class FavouriteList(Resource):
    @token_auth.login_required
    @api.expect(page_args)
    def get(self,id):
        '''get a user's favourite list'''
        # get favourite list -> User.favourite
        args = page_args.parse_args()
        page = args.get('page')
        page_size = args.get('pagesize')
        user = User.query.get_or_404(id)
        favourite = user.favourite
        favourite_num = favourite.count()
        page_number = ceil(favourite_num / page_size)

        err_message = {}
        if favourite_num == 0:
            err_message["not_liked"] = "this user has not liked any recipe"
        if page > page_number:
            err_message["page"] = "no content this page"
        if err_message:
            return {'message': err_message}, 404

        start = page_size * (page - 1)
        end = start + page_size
        page_list = favourite.slice(start, end).all()
        page_list.reverse()

        favourites = []
        for recipe in page_list:
            dic = {'recipe_id': recipe.id, 'recipe_name': recipe.recipe_name, 'photo': recipe.photo,
                   'last_modified': recipe.last_modified.strftime("%Y-%m-%d %H:%M"),
                   'views': recipe.view_num, 'likes': recipe.like_num, 'comments': recipe.comment_num,
                   'popular': recipe.popular,
                   'url': url_for('recipe', id=recipe.id)}
            favourites.append(dic)

        link = {'self': {'href': f'/favourite/user/{str(id)}?page={str(page)}&pagesize={str(page_size)}'}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f'/favourite/user/{str(id)}?page={str(page)}&pagesize={str(page_size)}'}
            elif page == page_number:
                link['previous'] = {
                    'href': f'/favourite/user/{str(id)}?page={str(page - 1)}&pagesize={str(page_size)}'}
            else:
                link['next'] = {
                    'href': f'/favourite/user/{str(id)}?page={str(page + 1)}&pagesize={str(page_size)}'}
                link['previous'] = {
                    'href': f'/favourite/user/{str(id)}?page={str(page - 1)}&pagesize={str(page_size)}'}

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "recipe_per_page": page_size,
                     "total_recipe_number": favourite_num}

        return {'page_info': page_info,
                'likes': favourites,
                '_links': link}, 200


@api.route('/recipe/<int:id>')
class RecipeLikeList(Resource):
    @token_auth.login_required
    @api.expect(page_args)
    def get(self,id):
        '''get a user list who likes the target recipe'''
        # get user list -> Recipe.likes
        args = page_args.parse_args()
        page = args.get('page')
        page_size = args.get('pagesize')
        recipe = Recipe.query.get_or_404(id)
        likes = recipe.likes
        likes.reverse()
        like_num = len(likes)
        page_number = ceil(like_num / page_size)

        err_message = {}
        if like_num == 0:
            err_message["not_liked"] = "this recipe has not been liked by anyone"
        if page > page_number:
            err_message["page"] = "no content this page"
        if err_message:
            return {'message': err_message}, 404

        start = page_size * (page - 1)
        end = start + page_size
        page_list = likes[start:end]

        like = []
        for people in page_list:
            dic = {'user_id': people.id, 'user_name': people.username, 'photo': people.avatar, 'email': people.email,
                   'url': url_for('user', id=people.id)}
            like.append(dic)

        link = {'self': {'href': f'/favourite/recipe/{str(id)}?page={str(page)}&pagesize={str(page_size)}'}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f'/favourite/recipe/{str(id)}?page={str(page)}&pagesize={str(page_size)}'}
            elif page == page_number:
                link['previous'] = {
                    'href': f'/favourite/recipe/{str(id)}?page={str(page - 1)}&pagesize={str(page_size)}'}
            else:
                link['next'] = {
                    'href': f'/favourite/recipe/{str(id)}?page={str(page + 1)}&pagesize={str(page_size)}'}
                link['previous'] = {
                    'href': f'/favourite/recipe/{str(id)}?page={str(page - 1)}&pagesize={str(page_size)}'}

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "user_per_page": page_size,
                     "total_user_number": like_num}

        return {'page_info': page_info,
                'likes': like,
                '_links': link}, 200


@api.route('/recipe/<int:id>/check')
class CheckLike(Resource):
    @token_auth.login_required
    def get(self,id):
        '''check if current_user liked targeted recipe'''
        # used for frontend check
        recipe = Recipe.query.get_or_404(id)
        return {"message": recipe.check_like(g.current_user)},200

