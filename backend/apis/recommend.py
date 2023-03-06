from flask_restx import Resource, Namespace, reqparse
from apis.models import Recipe
from flask import url_for
from math import ceil

api = Namespace('recommend', description="recommend operation")


@api.route("/<int:id>", endpoint='recommend')
class JaccardSimiRecommendation(Resource):

    @api.doc(description="Calculate similarity depends on Jaccard Similarity. Will list top 5 recipe from high to low.\n"
                         "If with same simi, then sort by last modified time by desc\n"
                         "recipe with 0 simi will not be included so there may be less than 5 recipes in recommend list\n"
                         "if no similar recipe will response no related recipes\n")
    def get(self, id):
        '''get recommend depend on ingredient similarity -- no login required'''

        def get_all_ingredients(text):
            result = []
            tmp = text.split(",")
            for item in tmp:
                ingredient = item.split(":")[0].lower().strip()
                if ingredient[-1] == "s":
                    result.append(ingredient[:-1])
                else:
                    result.append(ingredient)
            return result

        target_recipe = Recipe.query.get_or_404(id)
        target_ingredients = get_all_ingredients(target_recipe.ingredient_detail)
        target_meal_type = target_recipe.meal_type.split(",")
        # print(target_ingredients)
        all_recipe = Recipe.query.all()
        similarity = []
        for recipe in all_recipe:
            if recipe.id != id:
                ingredients = get_all_ingredients(recipe.ingredient_detail)
                # print(recipe,ingredients)
                cur_meal_type = recipe.meal_type.split(",")
                if len(set(target_meal_type).intersection(set(cur_meal_type))) > 0:
                    simi = len(set(target_ingredients).intersection(set(ingredients))) / \
                           len(set(target_ingredients).union(set(ingredients)))
                    if simi != 0:
                        similarity.append([recipe, simi])

        similarity = sorted(similarity, key=lambda x: (x[1], x[0].last_modified), reverse=True)
        res = similarity[:5]
        recipes = []
        for item in res:
            simi = item[1]
            item = item[0]
            dic = {'recipe_id': item.id, 'similarity': simi, 'author_id': item.author.id,
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

        if len(recipes) > 0:
            return {
                'recipes': recipes,
                '_link': url_for('recommend', id=id)
            }
        else:
            return {
                'message': 'no related recipes'
            }
