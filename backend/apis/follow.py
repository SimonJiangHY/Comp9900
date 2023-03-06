from flask_restx import Resource, Namespace, reqparse
from flask import g, url_for
from apis import db
from apis.models import User, Recipe, subscribe
from apis.auth import token_auth
from math import ceil

api = Namespace('follow', description="subscribe operations")
page_args = reqparse.RequestParser()
page_args.add_argument("page", required=True, type=int, location='args')
page_args.add_argument("pagesize", required=True, type=int, location='args')


@api.route('/subscribe/<int:id>')
class Subscribe(Resource):
    @token_auth.login_required
    def get(self, id):
        '''subscribe a user'''
        cur_user = g.current_user
        tar_user = User.query.get_or_404(id)
        err_message = {}
        if cur_user.id == tar_user.id:
            err_message['message'] = "you can't subscribe yourself"
        if cur_user.check_subscribe(tar_user):
            err_message['message'] = "already subscribed"
        if err_message:
            return err_message, 404
        cur_user.following_num += 1
        tar_user.follower_num += 1
        cur_user.subscribe_user(tar_user)
        db.session.commit()

        return {'message': f'succeed, you have subscribed user {tar_user.id}'}, 200


@api.route('/unsubscribe/<int:id>')
class Unsubscribe(Resource):
    @token_auth.login_required
    def get(self, id):
        '''unsubscribe a user'''
        cur_user = g.current_user
        tar_user = User.query.get_or_404(id)
        err_message = {}
        if cur_user.id == tar_user.id:
            err_message['message'] = "you can't unsubscribe yourself"
        if not cur_user.check_subscribe(tar_user):
            err_message['message'] = "you don't subscribe this user"
        if err_message:
            return err_message, 404
        cur_user.following_num -= 1
        tar_user.follower_num -= 1
        cur_user.unsubscribe_user(tar_user)
        db.session.commit()

        return {'message': f'succeed, you have unsubscribed user {tar_user.id}'}, 200


@api.route('/<int:id>/following')
class FollowingList(Resource):
    @token_auth.login_required
    @api.expect(page_args)
    def get(self, id):
        '''show your following list'''
        args = page_args.parse_args()
        page = args.get('page')
        page_size = args.get('pagesize')
        user = User.query.get_or_404(id)
        res = user.subscribed.all()
        res.reverse()
        follow_num = len(res)
        page_number = ceil(follow_num / page_size)

        err_message = {}
        if follow_num == 0:
            err_message["follow"] = "you have not followed anyone yet"
        if page > page_number:
            err_message["page"] = "no content this page"
        if err_message:
            return {'message': err_message}, 200

        start = page_size * (page - 1)
        end = start + page_size
        page_list = res[start:end]

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "following_per_page": page_size,
                     "total_following_number": follow_num}

        follows = []
        for people in page_list:
            dic = {'user_id': people.id, 'user_name': people.username, 'photo': people.avatar, 'email': people.email,
                   'url': url_for('user', id=people.id)}
            follows.append(dic)

        link = {'self': {'href': f'/follow/{str(id)}/following?page={str(page)}&pagesize={str(page_size)}'}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f'/follow/{str(id)}/following?page={str(page+1)}&pagesize={str(page_size)}'}
            elif page == page_number:
                link['previous'] = {'href': f'/follow/{str(id)}/following?page={str(page-1)}&pagesize={str(page_size)}'}
            else:
                link['next'] = {'href': f'/follow/{str(id)}/following?page={str(page+1)}&pagesize={str(page_size)}'}
                link['previous'] = {'href': f'/follow/{str(id)}/following?page={str(page-1)}&pagesize={str(page_size)}'}

        return {'page_info': page_info,
                'follows': follows,
                '_links': link}, 200


@api.route('/<int:id>/followers')
class FollowerList(Resource):
    @token_auth.login_required
    @api.expect(page_args)
    def get(self, id):
        '''show your followers list'''
        args = page_args.parse_args()
        page = args.get('page')
        page_size = args.get('pagesize')
        user = User.query.get_or_404(id)
        res = user.fans.all()
        res.reverse()
        fan_num = len(res)
        page_number = ceil(fan_num / page_size)

        err_message = {}
        if fan_num == 0:
            err_message["follow"] = "you have no fans yet"
        if page > page_number:
            err_message["page"] = "no content this page"
        if err_message:
            return {'message': err_message}, 200

        start = page_size * (page - 1)
        end = start + page_size
        page_list = res[start:end]

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "follower_per_page": page_size,
                     "total_follower_number": fan_num}

        fans = []
        for people in page_list:
            dic = {'user_id': people.id, 'user_name': people.username, 'photo': people.avatar,'email': people.email,
                   'url': url_for('user', id=people.id)}
            fans.append(dic)

        link = {'self': {'href': f'/follow/{str(id)}/followers?page={str(page)}&pagesize={str(page_size)}'}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href':  f'/follow/{str(id)}/followers?page={str(page+1)}&pagesize={str(page_size)}'}
            elif page == page_number:
                link['previous'] = {'href': f'/follow/{str(id)}/followers?page={str(page-1)}&pagesize={str(page_size)}'}
            else:
                link['next'] = {'href':  f'/follow/{str(id)}/followers?page={str(page+1)}&pagesize={str(page_size)}'}
                link['previous'] = {'href':  f'/follow/{str(id)}/followers?page={str(page-1)}&pagesize={str(page_size)}'}

        return {'page_info': page_info,
                'follows': fans,
                '_links': link}, 200


@api.route('/following_recipes')
class FollowingRecipeList(Resource):
    @token_auth.login_required
    @api.expect(page_args)
    def get(self):
        '''show your personal recipe news (recipes owned by your following user)'''
        args = page_args.parse_args()
        user = g.current_user
        res = Recipe.query\
            .join(subscribe, (subscribe.c.contributor_id == Recipe.author_id))\
            .filter(subscribe.c.fan_id == user.id)\
            .order_by(Recipe.last_modified.desc())

        page = args['page']
        page_size = args['pagesize']
        recipe_num = res.count()
        page_number = ceil(recipe_num / page_size)
        start = page_size * (page - 1)
        end = start + page_size
        page_list = res.slice(start, end).all()

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "recipe_per_page": page_size,
                     "total_recipe_number": recipe_num}

        recipes = []
        for item in page_list:
            dic = {'recipe_id': item.id, 'author_id': item.author.id,
                   'recipe_name': item.recipe_name, 'photo': item.photo,
                   'last_modified': item.last_modified.strftime("%Y-%m-%d %H:%M"),
                   'description': item.description,
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

        link = {'self': {'href': f'/follow/following_recipes?page={str(page)}&pagesize={str(page_size)}'}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f'/follow/following_recipes?page={str(page+1)}&pagesize={str(page_size)}'}
            elif page == page_number:
                link['previous'] = {'href': f'/follow/following_recipes?page={str(page-1)}&pagesize={str(page_size)}'}
            else:
                link['next'] = {'href': f'/follow/following_recipes?page={str(page+1)}&pagesize={str(page_size)}'}
                link['previous'] = {'href': f'/follow/following_recipes?page={str(page-1)}&pagesize={str(page_size)}'}

        if not recipes:
            return {'message': "no content this page"}

        return {'page_info': page_info,
                'recipes': recipes,
                '_links': link}, 200
