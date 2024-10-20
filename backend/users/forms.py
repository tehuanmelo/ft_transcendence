from django.contrib.auth import get_user_model
from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = get_user_model()
        fields = ("username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["password1"].help_text = None  # Hide default help text
        self.fields["password2"].help_text = None  # Hide default help text


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
