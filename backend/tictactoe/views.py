from django.shortcuts import render
from users.auth import jwt_login_required
from tictactoe.models import TicTacToeGame

@jwt_login_required
def ttt(request):
    print ("..")
    return render(request, "ttt/ttt.html")

# Create your views here.
