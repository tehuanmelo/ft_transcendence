import json
import random
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render

from .models import TicTacToeGame
from users.auth import jwt_login_required
from users.models import Match


@jwt_login_required
@require_http_methods(["GET"])
def tictactoe(request):
    return render(request, "ttt/ttt.html")


@jwt_login_required
@require_http_methods(["POST"])
def create_game(request):
    try:
        data = json.loads(request.body)
        opponent_name = data.get("opponent_name")
        user_player = random.choice(["X", "O"])
        opponent_player = "O" if user_player == "X" else "X"

        game = TicTacToeGame.objects.create(
            user=request.user,
            opponent=opponent_name,
            board=[["", "", ""], ["", "", ""], ["", "", ""]],
            current_player=random.choice(["X", "O"]),
        )
        return JsonResponse(
            {
                "game_id": game.id,
                "board": game.board,
                "current_player": game.current_player,
                "user_player": user_player,
                "opponent_player": opponent_player,
            }
        )
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@jwt_login_required
@require_http_methods(["POST"])
def make_move(request, game_id):
    try:
        game = TicTacToeGame.objects.get(id=game_id)
    except TicTacToeGame.DoesNotExist:
        return JsonResponse({"error": "Game not found"}, status=404)

    if (game.status != "in_progress"):
        return JsonResponse({"error": "Game has already finished"}, status=400)

    try:
        data = json.loads(request.body)
        row = data.get("row")
        col = data.get("col")
        current_player = data.get("current_player")
        user_player = data.get("user_player")
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid data"}, status=400)

    if game.board[row][col] == "":
        game.board[row][col] = current_player
        game.current_player = "O" if current_player == "X" else "X"

        winner = check_winner(game.board)
        if winner is None:
            if all(cell != "" for row in game.board for cell in row):
                game.status = "draw"
            else:
                game.status = "in_progress"
        else:
            game.status = "win" if winner == user_player else "loss"

        game.save()

        if game.status in ["win", "loss", "draw"]:
            Match.objects.create(
                user=game.user,
                opponents=[game.opponent],
                result=game.status,
                mode="tictactoe",
            )

    return JsonResponse(
        {
            "board": game.board,
            "current_player": game.current_player,
            "game_status": game.status,
        }
    )


def check_winner(board):
    # Check rows, columns, and diagonals for a winner
    for i in range(3):
        if board[i][0] == board[i][1] == board[i][2] != "":
            return board[i][0]
        if board[0][i] == board[1][i] == board[2][i] != "":
            return board[0][i]
    if board[0][0] == board[1][1] == board[2][2] != "":
        return board[0][0]
    if board[0][2] == board[1][1] == board[2][0] != "":
        return board[0][2]
    return None
