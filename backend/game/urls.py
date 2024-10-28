from django.urls import path

from .views import pong, tictactoe

urlpatterns = [
    path("pong", pong.pong_view, name="pong"),
    # tictactoe paths
    path("tictactoe/create/", tictactoe.create_game, name="create_game"),
    path("tictactoe/move/<int:game_id>/", tictactoe.make_move, name="make_move"),
    path("tictactoe/", tictactoe.tictactoe_view, name="tictactoe"),
]
