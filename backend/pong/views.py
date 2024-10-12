from django.shortcuts import render
from users.auth import jwt_fetch_user, jwt_login_required


@jwt_fetch_user
def pong(request):
    return render(request, "pong/pong.html")


@jwt_login_required
def tournament(request):
    return render(request, "pong/tournament.html")
