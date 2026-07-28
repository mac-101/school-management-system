from rest_framework.serializers import ModelSerializer
from ..models import Post, User


class PostSerializers(ModelSerializer):
    class Meta:
        model = Post
        fields = ['id','title','body']
        
class RegisterSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user