from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from my_decorators import handle_db_insert_error, secure_bookmark, is_valid_user, is_valid_user_int, is_valid_int_delete, check_ownership_of_following
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        # Your code here
        followings = Following.query.filter_by(user_id = self.current_user.id).order_by('id').all()
        print(followings)
        Following_list_of_dictionaries = [
            following.to_dict_following() for following in followings
        ]
        return Response(json.dumps(Following_list_of_dictionaries), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    @is_valid_user_int
    @is_valid_user
    @handle_db_insert_error
    def post(self):
        # Your code here
        body = request.get_json()
        user_id = body.get('user_id')
        print(user_id)
        following = Following(self.current_user.id, user_id)
        db.session.add(following)
        db.session.commit()
        
        return Response(json.dumps(following.to_dict_following()), mimetype="application/json", status=201)

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    @is_valid_int_delete
    @check_ownership_of_following
    def delete(self, id):
        # Your code here
        
        Following.query.filter_by(id = id).delete()
        db.session.commit()
        serialized_data = {
            'message' : 'Following {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps({}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
