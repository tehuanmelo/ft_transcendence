from django.shortcuts import render
from users.auth import jwt_fetch_user


@jwt_fetch_user
def pong_view(request):
    return render(request, "game/pong.html")
