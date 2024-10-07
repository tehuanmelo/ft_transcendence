from django.contrib.auth import get_user_model
from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = get_user_model()
        fields = (
            "username",
            "email",
        )


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = get_user_model()
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "nick_name",
            "bio",
            "github",
            "twitter",
            "profile_image",
            "google_auth_key",
        ]


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "bio",
            "github",
            "twitter",
            "profile_image",
        ]
        widgets = {
            "bio": forms.Textarea(attrs={"rows": 3, "cols": 40}),
            "profile_image": forms.ClearableFileInput(attrs={"class": "form-control"}),
        }
