from django.urls import path
from .views import ProcessDatasetView, RegisterView, UserProjectsView, UserProfileView, ProjectDeleteView, TrainModelView
urlpatterns = [
    path('process/', ProcessDatasetView.as_view(), name='process-dataset'),
    path('register/', RegisterView.as_view(), name='register'),
    path('projects/', UserProjectsView.as_view(), name='user-projects'),
    path('projects/<int:pk>/', ProjectDeleteView.as_view(), name='delete-project'), 
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('train/', TrainModelView.as_view(), name='train-model'),
]