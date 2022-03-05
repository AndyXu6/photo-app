from flask import Response
from flask_restful import Resource
from models import LikePost, db
import json
from . import can_view_post
from my_decorators import handle_db_insert_error, is_valid_int_like, secure_bookmark_like, is_valid_int_delete_like, check_ownership_of_like
import flask_jwt_extended
class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    @is_valid_int_like
    @secure_bookmark_like
    @handle_db_insert_error
    def post(self, post_id):
        # Your code here
    
        like = LikePost(self.current_user.id, post_id)
        db.session.add(like)
        db.session.commit()
        
        return Response(json.dumps(like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    

    @flask_jwt_extended.jwt_required()
    @is_valid_int_delete_like
    @check_ownership_of_like
    def delete(self, post_id, id):
        # Your code here
        
        LikePost.query.filter_by(id = id).delete()
        db.session.commit()
        serialized_data = {
            'message' : 'like {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps({}), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
