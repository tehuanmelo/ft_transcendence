from django.shortcuts import render
from users.auth import jwt_required, fetch_user


def index(request):
    return render(request, "pages/index.html")

@fetch_user
def home(request):
    return render(request, "pages/home.html")

@fetch_user
def about(request):
    return render(request, "pages/about.html")
