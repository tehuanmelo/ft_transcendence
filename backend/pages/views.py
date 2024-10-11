from django.conf import settings as django_settings
from django.shortcuts import render
from users.auth import jwt_fetch_user, jwt_login_required


@jwt_fetch_user
def home(request):
    context = {
        "API_42_CLIENT_ID": django_settings.API_42_CLIENT_ID,
        "API_42_REDIRECT_URI": django_settings.API_42_REDIRECT_URI,
    }
    return render(request, "pages/home.html", context)


@jwt_fetch_user
def about(request):
    return render(request, "pages/about.html")


@jwt_login_required
def settings(request):
    return render(request, "pages/settings.html")
