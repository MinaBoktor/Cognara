# api/serializers.py
from rest_framework import serializers
from .models import Comment

class UserSerializer(serializers.Serializer):
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    avatar_url = serializers.URLField()

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    parent_comment = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'article_id', 'content', 'created_at', 'updated_at', 
                 'is_approved', 'like_count', 'user', 'parent_id', 'parent_comment']

    def get_parent_comment(self, obj):
        if obj.parent:
            return {
                'id': obj.parent.id,
                'content': obj.parent.content,
                'user': {
                    'username': obj.parent.user.username,
                    'name': f"{obj.parent.user.first_name or ''} {obj.parent.user.last_name or ''}".strip()
                } if obj.parent.user else None
            }
        return None