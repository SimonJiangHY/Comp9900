from flask_restx import Resource, Namespace, reqparse
from flask import g, url_for
from apis import db
from apis.models import Recipe
from math import ceil
from datetime import datetime, timedelta
from utils import popularCalculate

api = Namespace('ranking', description="ranking list")
# page_args = reqparse.RequestParser()
# page_args.add_argument("page", required=True, type=int, location='args')
# page_args.add_argument("pagesize", required=True, type=int, location='args')
# page_args.add_argument("num", required=True, type=int, location='args')

time_args = reqparse.RequestParser()
time_args.add_argument("page", required=True, type=int, location='args')
time_args.add_argument("pagesize", required=True, type=int, location='args')
#time_args.add_argument("num", required=True, type=int, location='args')
time_args.add_argument("time", type=str, choices=['within_today', 'within_1_week', 'within_1_month'], location='args')

@api.route('/popular')
class UpdatePopular(Resource):

    def patch(self):
        recipes = Recipe.query.all()
        for recipe in recipes:
            sum_comment = recipe.comment_num
            sum_view = recipe.view_num
            sum_like = recipe.like_num
            sum_follower = recipe.author.follower_num
            update_time = recipe.last_modified
            cur_time = datetime.utcnow()
            tar_time = (cur_time - update_time).days
            recipe.popular = popularCalculate.get_popular(sum_comment, sum_view, sum_like, sum_follower, tar_time)
        db.session.commit()
        return {"message": "update succeed"}, 200


@api.route('/franking')
class FliterRankingList(Resource):
    @api.expect(time_args)
    def get(self):
        '''get ranking list in a time period'''
        args = time_args.parse_args()
        page = args['page']
        page_size = args['pagesize']
        #num = args['num']
        num = 10
        tar_time = args['time']

        cur_time = datetime.utcnow()
        yy = int(cur_time.year)
        mm = int(cur_time.month)
        dd = int(cur_time.day)

        if not tar_time:
            recipes = Recipe.query.order_by(Recipe.popular.desc()).order_by(Recipe.last_modified.desc()).all()
        else:
            if tar_time == "within_today":
                date_tar_time = datetime(yy, mm, dd, 23, 59, 59)
                ntar_time = (date_tar_time + timedelta(days=-1)).strftime("%Y-%m-%d %H:%M")
            elif tar_time == "within_1_week":
                date_tar_time = datetime(yy, mm, dd, 00, 00, 00)
                ntar_time = (date_tar_time + timedelta(days=-6)).strftime("%Y-%m-%d %H:%M")
            elif tar_time == "within_1_month":
                if mm in [1, 3, 5, 7, 8, 10, 12]:
                    delta = 31
                elif mm in [4, 6, 9, 11]:
                    delta = 30
                else:
                    if yy%4 == 0:
                        delta = 29
                    else:
                        delta = 28
                date_tar_time = datetime(yy, mm, dd, 00, 00, 00)
                ntar_time = (date_tar_time + timedelta(days=-delta)).strftime("%Y-%m-%d %H:%M")
            else:
                return {'message': "choice error"}, 404
            recipes = Recipe.query.filter(Recipe.last_modified.between(ntar_time, cur_time)) \
            .order_by(Recipe.popular.desc()).order_by(Recipe.last_modified.desc()).all()

        print(recipes)
        new_res = recipes[0:num]
        recipe_num = len(new_res)

        page_number = ceil(recipe_num / page_size)

        err_message = {}
        if recipe_num == 0:
            err_message = "no content this page"
        if page > page_number:
            err_message = "no content this page"
        if err_message:
            return {'message': err_message}, 404

        start = page_size * (page - 1)
        end = start + page_size
        page_list = new_res[start:end]

        detail_recipes = []
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
            detail_recipes.append(dic)

        if not tar_time:
            link = {'self': {
                'href': f"/ranking/franking?page={str(page)}&pagesize={str(page_size)}&num={str(num)}"}}
            if page_number > 1:
                if page == 1:
                    link['next'] = {
                        'href': f"/ranking/franking?page={str(page + 1)}&pagesize={str(page_size)}"}
                elif page == page_number:
                    link['previous'] = {
                        'href': f"/ranking/franking?page={str(page - 1)}&pagesize={str(page_size)}"}
                else:
                    link['next'] = {
                        'href': f"/ranking/franking?page={str(page + 1)}&pagesize={str(page_size)}"}
                    link['previous'] = {
                        'href': f"/ranking/franking?page={str(page - 1)}&pagesize={str(page_size)}"}
        else:
            link = {'self': {'href': f"/ranking/franking?page={str(page)}&pagesize={str(page_size)}&time={str(tar_time)}"}}
            if page_number > 1:
                if page == 1:
                    link['next'] = {
                        'href': f"/ranking/franking?page={str(page + 1)}&pagesize={str(page_size)}&time={str(tar_time)}"}
                elif page == page_number:
                    link['previous'] = {
                        'href': f"/ranking/franking?page={str(page - 1)}&pagesize={str(page_size)}&time={str(tar_time)}"}
                else:
                    link['next'] = {
                        'href': f"/ranking/franking?page={str(page + 1)}&pagesize={str(page_size)}&time={str(tar_time)}"}
                    link['previous'] = {
                        'href': f"/ranking/franking?page={str(page - 1)}&pagesize={str(page_size)}&time={str(tar_time)}"}
        print(cur_time)
        return {'recipes': detail_recipes,
                '_links': link}, 200



