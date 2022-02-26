from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post
from my_decorators import handle_db_insert_error, secure_bookmark, is_valid_int, is_valid_int_delete, check_ownership_of_comment

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @is_valid_int
    @secure_bookmark
    @handle_db_insert_error
    def post(self):
        # Your code here
         # this is the data that the user sent us:
        body = request.get_json()
        post_id = body.get('post_id')
        text = body.get('text')
        # to create a Bookmark, you need to pass it a user_id

        # these two lines save ("commit") the new record to the database:
        comment = Comment(text, self.current_user.id, post_id)
        db.session.add(comment)
        db.session.commit()
        
        return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @is_valid_int_delete
    @check_ownership_of_comment
    def delete(self, id):
        # Your code here
        Comment.query.filter_by(id = id).delete()
        db.session.commit()
        serialized_data = {
            'message' : 'Comment {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps({}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
