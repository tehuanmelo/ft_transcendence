from django.shortcuts import render
from users.auth import jwt_required


@jwt_required
def pong(request):
    return render(request, "pong/pong.html")
