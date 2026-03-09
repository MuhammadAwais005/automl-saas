from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.conf import settings
import os

# 1. The Project History Model
class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    original_file = models.FileField(upload_to='uploads/')
    processed_file = models.FileField(upload_to='processed/', null=True, blank=True)
    heatmap_url = models.CharField(max_length=255, null=True, blank=True) # <--- ADDED HEATMAP
    initial_score = models.IntegerField(default=0)
    final_score = models.IntegerField(default=0)
    report = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.file_name}"

# 2. The User Profile Model
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return self.user.username

# --- SIGNALS FOR AUTO-CREATING PROFILE ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# --- SIGNALS FOR AUTO-DELETING FILES FROM FOLDERS ---

# 1. Delete Old Avatar when uploading a new one
@receiver(pre_save, sender=Profile)
def delete_old_avatar(sender, instance, **kwargs):
    if not instance.pk: return
    try:
        old_avatar = Profile.objects.get(pk=instance.pk).avatar
    except Profile.DoesNotExist: return
    
    # If the avatar is changing, delete the old image file
    if old_avatar and old_avatar.name != instance.avatar.name:
        if os.path.isfile(old_avatar.path):
            os.remove(old_avatar.path)

# 2. Delete Datasets and Plots when a Project is deleted
@receiver(post_delete, sender=Project)
def delete_project_files(sender, instance, **kwargs):
    # Delete Original CSV
    if instance.original_file and os.path.isfile(instance.original_file.path):
        os.remove(instance.original_file.path)
        
    # Delete Processed CSV
    if instance.processed_file and os.path.isfile(instance.processed_file.path):
        os.remove(instance.processed_file.path)
        
    # Delete Heatmap Plot
    if instance.heatmap_url:
        relative_path = instance.heatmap_url.replace(settings.MEDIA_URL, '')
        full_plot_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        if os.path.isfile(full_plot_path):
            os.remove(full_plot_path)