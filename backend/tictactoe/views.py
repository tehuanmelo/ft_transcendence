import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render

from .models import TicTacToeGame
from users.auth import jwt_login_required


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
        game = TicTacToeGame.objects.create(
            user=request.user,
            opponent=opponent_name,
            board=[["", "", ""], ["", "", ""], ["", "", ""]],
            current_player="X",
        )
        return JsonResponse(
            {
                "game_id": game.id,
                "board": game.board,
                "current_player": game.current_player,
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

    try:
        data = json.loads(request.body)
        row = data.get("row")
        col = data.get("col")
        current_player = data.get("player")
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid data"}, status=400)

    if game.board[row][col] == "" and game.current_player == current_player:
        game.board[row][col] = current_player
        game.current_player = "O" if current_player == "X" else "X"
        game.winner = check_winner(game.board)
        game.save()

        # Update match history if there's a winner
        if game.winner:
            result = "win" if game.winner == current_player else "loss"
            Match.objects.create(
                user=game.user if game.winner == "X" else None,
                opponent=game.opponent if game.winner == "O" else None,
                result=result,
            )

    return JsonResponse(
        {
            "board": game.board,
            "current_player": game.current_player,
            "winner": game.winner,
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
