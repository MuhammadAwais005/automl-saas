from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Project, Profile

# User Registration
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# Project History (Includes 'report' now)
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'file_name', 'initial_score', 'final_score', 'created_at', 'processed_file', 'report']

# User Profile (Handles Image Upload)
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'full_name', 'job_title', 'company', 'avatar']