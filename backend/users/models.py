from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    profile_image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    bio = models.TextField(blank=True, null=True)
    github = models.URLField(max_length=200, blank=True, null=True)
    twitter = models.URLField(max_length=200, blank=True, null=True)
    nick_name = models.CharField(max_length=100, null=True, blank=True)
    google_auth_key = models.CharField(max_length=200, null=True, default=None)
    is_2fa_set = models.BooleanField(default=False)
    qrcode_img = models.ImageField(upload_to="qr_codes/", blank=True, null=True)
    token_version = models.IntegerField(default=0)
    is_authenticated = models.BooleanField(default=False)
