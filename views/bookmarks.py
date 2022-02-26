from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
import json
from . import can_view_post
from my_decorators import handle_db_insert_error, secure_bookmark, check_ownership_of_bookmark, is_valid_int, is_valid_int_delete

class BookmarksListEndpoint(Resource):
    # 1. Lists all of the bookmarks
    # 2. Create a new bookmark

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here
        '''
        Goal is to only show the bookmarks that are associated with the current user. Approach:
            1. Use Sql Alchemy to execute the query using the "Bookmark" model
            2. When we return this list, it's serialized using JSON.
        '''
        bookmarks = Bookmark.query.filter_by(user_id = self.current_user.id).order_by('id').all()
        print(bookmarks)
        bookmark_list_of_dictionaries = [
            bookmark.to_dict() for bookmark in bookmarks
        ]
        return Response(json.dumps(bookmark_list_of_dictionaries), mimetype="application/json", status=200)

    @is_valid_int
    @secure_bookmark
    @handle_db_insert_error
    def post(self):
        # Your code here
        '''
        Goal:
            1. get the post_id from the request body
            2. Check that the user is 

        '''
        # this is the data that the user sent us:
        body = request.get_json()
        post_id = body.get('post_id')
        # to create a Bookmark, you need to pass it a user_id

        # these two lines save ("commit") the new record to the database:
        bookmark = Bookmark(self.current_user.id, post_id)
        db.session.add(bookmark)
        db.session.commit()
        
        return Response(json.dumps(bookmark.to_dict()), mimetype="application/json", status=201)

class BookmarkDetailEndpoint(Resource):

    # 1. PATCH, Get, DELETE
    # 2. create a new one
    def __init__(self, current_user):
        self.current_user = current_user

    @is_valid_int_delete
    @check_ownership_of_bookmark
    def delete(self, id):
        # Your code here
        
        Bookmark.query.filter_by(id = id).delete()
        db.session.commit()
        serialized_data = {
            'message' : 'Bookmark {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps({}), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<id>', 
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
