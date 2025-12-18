import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        print("WebSocket connection attempt started")  # Add this
        self.group = 'timeline'

        try:
            async_to_sync(self.channel_layer.group_add)(self.group, self.channel_name)
            print(f"Added to group: {self.group}")  # Add this
            self.accept()
            print("WebSocket connection accepted")  # Add this
        except Exception as e:
            print(f"Error in connect: {e}")  # Add this

    def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")  # Add this
        async_to_sync(self.channel_layer.group_discard)(self.group, self.channel_name)

    def receive(self, text_data):
        print(f"Received data: {text_data}")  # Add this
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        message = text_data_json['message']
        post_id = text_data_json['post_id']
        user_id = 1

        print(text_data_json)

        if message_type == 'post_reply':
            async_to_sync(self.channel_layer.group_send)(self.group, {
                'type': 'post_reply',
                'message': message,
                'post_id': post_id,
                'user_id': user_id
            })

    def post_reply(self, event):
        from .personas import choose_persona_ai, get_ai_responses, AI_PERSONAS
        from api.serializers import CommentSerializer
        data = {
            "content": event['message'],
            "post": event['post_id'],
            "created_by": event['user_id']
        }

        serializer = CommentSerializer(data=data)

        if serializer.is_valid():
            comment = serializer.save()
            print('saved new comment', comment.post.id)
            self.send(text_data=json.dumps({
                'type': 'post_reply',
                'message': comment.content,
                'post_id': comment.post.id,
                'user_id': comment.created_by.id
            }))

            conversation_history = [
                {"role": "user", "content": data["content"]}
            ]

            # Step 1: Let AI choose persona(s)
            selected_personas = choose_persona_ai(data["content"], conversation_history)
            print(selected_personas)

            if selected_personas:
                self.send(text_data=json.dumps({
                    'type': 'post_users_typing',
                    'message': list(map(lambda x: AI_PERSONAS[x]["username"], selected_personas)),
                    'post_id': comment.post.id,
                }))

            # Step 2: Generate their responses
            ai_responses = get_ai_responses(selected_personas, conversation_history)

            print(ai_responses)
            for ai_response in ai_responses:
                ai_comment = {
                    "content": ai_response["message"],
                    "post": event['post_id'],
                    "created_by": 1  # UPDATE,
                }

                serializer = CommentSerializer(data=ai_comment)

                if serializer.is_valid():
                    serializer.save()
                    self.send(text_data=json.dumps({
                        'type': 'post_reply',
                        'message': ai_response["message"],
                        'post_id': comment.post.id,
                        'user_id': comment.created_by.id,
                        "created_by_description": ai_response['persona']['description']
                    }))

        else:
            print('Error saving comment for post. Either the user id or post id is invalid')
            return
