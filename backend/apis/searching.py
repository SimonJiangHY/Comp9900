from flask_restx import Resource, Namespace, reqparse
from apis.models import Recipe
from flask import url_for
from math import ceil

api = Namespace('search', description="searching operation")

search_args = reqparse.RequestParser()
search_args.add_argument("recipe", required=True, type=str, location="args")
search_args.add_argument("type", required=True, type=str, location="args")
search_args.add_argument("ingredient", required=True, type=str, location="args")
search_args.add_argument("time", required=True, type=str, location="args")
search_args.add_argument("method", required=True, type=str, location="args")
search_args.add_argument("page", required=True, type=int, location="args")
search_args.add_argument("pagesize", required=True, type=int, location="args")


@api.route("", endpoint='search')
class SearchRecipe(Resource):

    @api.expect(search_args)
    @api.doc(description="if you don't want to use a filter, you should type null for that filter (i.e. recipe=null).\
     For multi attributes, split them by comma (i.e. recipe=lemon,noodles)")
    def get(self):
        '''search with filter -- no login required'''
        args = search_args.parse_args()
        recipe_list = []

        def sub_search(cur_arg, check):
            tmp_list = []
            filters = cur_arg.split(",")
            for cur_filter in filters:
                cur_query = f"%{cur_filter}%"
                tmp = []
                if check == "recipe":
                    tmp = Recipe.query.filter(Recipe.recipe_name.like(cur_query)).all()
                elif check == "type":
                    tmp = Recipe.query.filter(Recipe.meal_type.like(cur_query)).all()
                elif check == "ingredient":
                    tmp = Recipe.query.filter(Recipe.main_ingredients.like(cur_query)).all()
                elif check == "time":
                    tmp = Recipe.query.filter(Recipe.time.like(cur_query)).all()
                elif check == "method":
                    tmp = Recipe.query.filter(Recipe.method.like(cur_query)).all()
                tmp_list.append(tmp)
            res = set()
            for item in tmp_list:
                res = res | set(item)
            recipe_list.append(list(res))

        if args["recipe"] != "null":
            sub_search(args['recipe'], 'recipe')
        if args['type'] != "null":
            sub_search(args['type'], 'type')
        if args['ingredient'] != "null":
            sub_search(args['ingredient'], 'ingredient')
        if args['time'] != "null":
            sub_search(args['time'], 'time')
        if args['method'] != "null":
            sub_search(args['method'], 'method')

        recipe_results = set(Recipe.query.all())
        for item in recipe_list:
            recipe_results = recipe_results & set(item)

        recipe_results = sorted(recipe_results, key=lambda x: x.last_modified, reverse=True)

        page_size = args.get('pagesize')
        page = args.get('page')
        recipe_num = len(recipe_results)
        page_number = ceil(recipe_num / page_size)
        start = page_size * (page - 1)
        end = start + page_size
        page_list = recipe_results[start: end]

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

        link = {
            'self': {'href': url_for('search', recipe=args['recipe'], type=args['type'], ingredient=args['ingredient']
                                     , time=args['time'], method=args['method'], page=page, pagesize=page_size)}}
        if page_number > 1:
            if page == 1:
                link['next'] = {
                    'href': url_for('search', recipe=args['recipe'], type=args['type'], ingredient=args['ingredient']
                                    , time=args['time'], method=args['method'], page=page + 1, pagesize=page_size)}
            elif page == page_number:
                link['previous'] = {
                    'href': url_for('search', recipe=args['recipe'], type=args['type'], ingredient=args['ingredient']
                                    , time=args['time'], method=args['method'], page=page - 1, pagesize=page_size)}
            else:
                link['next'] = {
                    'href': url_for('search', recipe=args['recipe'], type=args['type'], ingredient=args['ingredient']
                                    , time=args['time'], method=args['method'], page=page + 1, pagesize=page_size)}
                link['previous'] = {
                    'href': url_for('search', recipe=args['recipe'], type=args['type'], ingredient=args['ingredient']
                                    , time=args['time'], method=args['method'], page=page - 1, pagesize=page_size)}

        if not recipes:
            return {'message': "no content this page"}

        return {'page_info': page_info,
                'recipes': recipes,
                '_links': link}, 200
