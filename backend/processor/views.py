from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth.models import User
import os

from .engine import DataEngine
from .models import Project, Profile
from .serializers import UserSerializer, ProjectSerializer, ProfileSerializer

# --- AUTH ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

# --- PROFILE (GET & UPDATE) ---
class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    parser_classes = (MultiPartParser, FormParser) # Allows Image Upload

    def get_object(self):
        return self.request.user.profile

# --- HISTORY ---
class UserProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).order_by('-created_at')

# --- PROCESSING ---
class ProcessDatasetView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny] 

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        file_path = default_storage.save(f"uploads/{file_obj.name}", file_obj)
        full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)

        try:
            engine = DataEngine(full_file_path)
            result = engine.process()
            
            # SAVE TO DB (Now includes 'report')
            if request.user.is_authenticated:
                Project.objects.create(
                    user=request.user,
                    file_name=file_obj.name,
                    original_file=file_path,
                    processed_file=result['download_url'].replace('/media/', ''),
                    initial_score=result['initial_score'],
                    final_score=result['final_score'],
                    report=result['report'] # <--- Saving the list of changes
                )

            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- NEW: DELETE PROJECT VIEW ---
class ProjectDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Allow deleting only if the project belongs to the current user
        return Project.objects.filter(user=self.request.user)
    
# --- NEW: TRAIN MODEL VIEW ---
class TrainModelView(APIView):
    permission_classes = [AllowAny] # Allow training for now (or change to IsAuthenticated)

    def post(self, request, *args, **kwargs):
        file_url = request.data.get('file_url') # We pass the processed file URL
        target = request.data.get('target')
        
        if not file_url or not target:
            return Response({"error": "Missing file or target"}, status=status.HTTP_400_BAD_REQUEST)

        # Convert URL to File Path
        # URL is like "/media/filename.csv", we need absolute path
        clean_path = file_url.replace('/media/', '')
        full_path = os.path.join(settings.MEDIA_ROOT, clean_path)

        try:
            # Load Engine with Processed Data
            engine = DataEngine(full_path)
            
            # Run Training
            result = engine.train_model(target)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)