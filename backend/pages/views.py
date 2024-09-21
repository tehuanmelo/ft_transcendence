from django.shortcuts import render
from users.auth import jwt_required


def index(request):
    return render(request, "pages/index.html")

@jwt_required
def home(request):
    return render(request, "pages/home.html")

@jwt_required
def about(request):
    return render(request, "pages/about.html")
