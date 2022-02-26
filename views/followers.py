from flask import Response, request
from flask_restful import Resource
from models import Following
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowerListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here
        followings = Following.query.filter_by(following_id = self.current_user.id).order_by('id').all()
        print(followings)
        Following_list_of_dictionaries = [
            following.to_dict_follower() for following in followings
        ]
        return Response(json.dumps(Following_list_of_dictionaries), mimetype="application/json", status=200)

    
def initialize_routes(api):
    api.add_resource(
        FollowerListEndpoint, 
        '/api/followers', 
        '/api/followers/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
