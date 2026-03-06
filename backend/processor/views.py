from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth.models import User
import os

from .models import Project, Profile
from .serializers import UserSerializer, ProjectSerializer, ProfileSerializer


# -----------------------------
# AUTH - REGISTER
# -----------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# -----------------------------
# PROFILE (GET & UPDATE)
# -----------------------------
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user.profile


# -----------------------------
# USER HISTORY
# -----------------------------
class UserProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            user=self.request.user
        ).order_by("-created_at")


# -----------------------------
# PROCESS DATASET
# -----------------------------
class ProcessDatasetView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def post(self, request):

        file_obj = request.FILES.get("file")

        if not file_obj:
            return Response(
                {"error": "No file uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Save uploaded file
            file_path = default_storage.save(
                f"uploads/{file_obj.name}",
                file_obj
            )

            full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)

            # Run ML Engine
            from .engine import DataEngine
            engine = DataEngine(full_file_path)
            result = engine.process()

            # Save project if logged in
            if request.user.is_authenticated:

                Project.objects.create(
                    user=request.user,
                    file_name=file_obj.name,
                    original_file=file_path,
                    processed_file=result.get("download_url", "").replace("/media/", ""),
                    initial_score=result.get("initial_score"),
                    final_score=result.get("final_score"),
                    report=result.get("report", [])
                )

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -----------------------------
# DELETE PROJECT
# -----------------------------
class ProjectDeleteView(generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)


# -----------------------------
# TRAIN MODEL
# -----------------------------
class TrainModelView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        file_url = request.data.get("file_url")
        target = request.data.get("target")

        if not file_url or not target:
            return Response(
                {"error": "Missing file or target column"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # Convert URL → File Path
            clean_path = file_url.replace("/media/", "")
            full_path = os.path.join(settings.MEDIA_ROOT, clean_path)

            # Run training
            from .engine import DataEngine
            engine = DataEngine(full_path)
            result = engine.train_model(target)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )