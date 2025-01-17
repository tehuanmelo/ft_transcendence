from django.contrib.auth import get_user_model
from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
import re


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = get_user_model()
        fields = ("username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["password1"].help_text = None  # Hide default help text
        self.fields["password2"].help_text = None  # Hide default help text

    def clean_username(self):  # clean_<field-name>
        username = self.cleaned_data.get(
            "username"
        )  # cleaned data returns the username from the model
        if not re.match(r"^[a-zA-Z0-9_-]+$", username):
            raise forms.ValidationError(
                "Username can only contain letters, numbers, dashes and underscores."
            )
        return username

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if not email:
            raise forms.ValidationError("Email field cannot be empty.")
        if get_user_model().objects.filter(email=email).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email


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
