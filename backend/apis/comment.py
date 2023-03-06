from flask_restx import Resource, fields, Namespace, reqparse
from apis.auth import token_auth
from apis import db
from apis.models import Comment, Recipe
from operator import itemgetter
from flask import request, g
from flask import url_for
from math import ceil

api = Namespace('comment', description="comment operations")


comment_model = api.model('model', {
    'content': fields.String('enter your comment here'),
    'recipe_id': fields.Integer('must provide recipe id'),
    'parent_id': fields.Integer('add comment id if you want to reply that comment, if not then remove this from json')
})

comment_list_arg = reqparse.RequestParser()
comment_list_arg.add_argument("recipe", required=True, type=int, location='args')
comment_list_arg.add_argument("page", required=True, type=int, location='args')
comment_list_arg.add_argument("pagesize", required=True, type=int, location='args')


@api.route("")
class CreateComment(Resource):

    @token_auth.login_required
    @api.expect(comment_model)
    def post(self):
        '''create a comment'''
        info = request.get_json()
        err_message = {}
        if 'content' not in info:
            err_message['content'] = "please provide your comment content"
        if 'recipe_id' not in info:
            err_message['recipe_id'] = "please provide your recipe id"
        if 'parent_id' in info:
            parent_id = info["parent_id"]
            if not Comment.query.filter(Comment.id == int(parent_id)).first():
                err_message['parent_id'] = "your parent_id does not exist"
        if err_message:
            return {'message': err_message}, 404

        comment = Comment()
        cur_user = g.current_user
        recipe_id = info['recipe_id']
        tar_recipe = Recipe.query.get_or_404(int(recipe_id))

        tar_recipe.comment_num += 1
        # tar_recipe.popular += 1
        comment.author = cur_user
        comment.recipe = tar_recipe
        comment.from_dict(info)
        db.session.add(comment)
        db.session.commit()
        return comment.to_dict(),200

    @api.expect(comment_list_arg)
    def get(self):
        '''get comments from a target recipe - no login required'''
        args = comment_list_arg.parse_args()
        recipe_id = args['recipe']
        tar_recipe = Recipe.query.get_or_404(recipe_id)
        parent_comment = tar_recipe.comments.filter(Comment.parent_id==None)
        page = args['page']
        page_size = args['pagesize']
        comment_num = parent_comment.count()
        page_number = ceil(comment_num / page_size)
        start = page_size * (page - 1)
        end = start + page_size
        page_list = parent_comment.slice(start, end).all()

        comments = []
        for item in page_list:
            data = {"id": item.id,
                    "content": item.content,
                    "timestamp": item.timestamp.strftime("%Y-%m-%d %H:%M"),
                    "url": url_for('comment',id=item.id),
                    "comment_author": {
                        "id": item.author.id,
                        "username": item.author.username,
                        "avatar": item.author.avatar
                    }
            }
            if item.children:
                sub_comments = []
                children = item.get_children()
                for child in children:
                    child_data = {
                        "id": child.id,
                        "content": child.content,
                        "timestamp": child.timestamp.strftime("%Y-%m-%d %H:%M"),
                        "parent_id": child.parent_id,
                        "url": url_for('comment', id=child.id),
                        "comment_author": {
                            "id": child.author.id,
                            "username": child.author.username,
                            "avatar": child.author.avatar,
                            'url': url_for('user', id=child.author.id)
                        }
                    }
                    sub_comments.append(child_data)
                sub_comments = sorted(sub_comments, key=itemgetter('timestamp'))
                data["sub_comments"] = sub_comments
            comments.append(data)
        # comment?recipe=2&page=1&pagesize=10
        link = {'self': {'href': f"/comment?recipe={str(recipe_id)}&page={str(page)}&pagesize={str(page_size)}"}}
        if page_number > 1:
            if page == 1:
                link['next'] = {'href': f"/comment?recipe={str(recipe_id)}&page={str(page+1)}&pagesize={str(page_size)}"}
            elif page == page_number:
                link['previous'] = {'href': f"/comment?recipe={str(recipe_id)}&page={str(page-1)}&pagesize={str(page_size)}"}
            else:
                link['next'] = {'href': f"/comment?recipe={str(recipe_id)}&page={str(page+1)}&pagesize={str(page_size)}"}
                link['previous'] = {'href':f"/comment?recipe={str(recipe_id)}&page={str(page-1)}&pagesize={str(page_size)}"}
        recipe = {'id': tar_recipe.id,
                  'recipe_name': tar_recipe.recipe_name,
                  'last_modified': tar_recipe.last_modified.strftime("%Y-%m-%d %H:%M"),
                  'url': url_for('recipe', id=tar_recipe.id),
                  'author': {
                      'id': tar_recipe.author.id,
                      'username': tar_recipe.author.username,
                      'avatar': tar_recipe.author.avatar,
                      'url': url_for('user', id=tar_recipe.author_id)
                    }
                  }

        if not comments:
            return {'message': "no content this page"}

        page_info = {"current_page": page,
                     "total_page_number": page_number,
                     "1st_comment_per_page": page_size,
                     "total_1st_comment_number": comment_num}

        return {'page_info': page_info,
                'recipe': recipe,
                'comments': comments,
                '_links': link}, 200



@api.route("/<int:id>", endpoint='comment')
class CommentProfile(Resource):

    def get(self,id):
        '''get a comment - no login required'''
        return Comment.query.get_or_404(id).to_dict(), 200

    @token_auth.login_required
    def delete(self,id):
        '''delete a comment'''
        comment = Comment.query.get_or_404(id)
        number = len(comment.get_children()) + 1
        if g.current_user == comment.author or g.current_user == comment.recipe.author:
            db.session.delete(comment)
            comment.recipe.comment_num -= number
            # comment.recipe.popular -= number
            db.session.commit()
            return {"message": "delete succeed"}, 200
        else:
            return {"message": "this comment/recipe is not yours"}, 404



