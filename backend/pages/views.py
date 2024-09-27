from django.shortcuts import render
from users.auth import jwt_fetch_user, jwt_login_required


@jwt_fetch_user
def home(request):
    return render(request, "pages/home.html")


@jwt_fetch_user
def about(request):
    return render(request, "pages/about.html")


@jwt_login_required
def settings(request):
    return render(request, "pages/settings.html")
