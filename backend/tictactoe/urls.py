from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.create_game, name="create_game"),
    path("move/<int:game_id>/", views.make_move, name="make_move"),
    path("reset/<int:game_id>/", views.reset_game, name="reset_game"),
    path("", views.tictactoe, name="tictactoe"),
]
