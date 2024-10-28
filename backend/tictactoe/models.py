from django.contrib.postgres.fields import ArrayField
from django.db import models


class TicTacToeGame(models.Model):
    user = models.ForeignKey(
        "users.CustomUser", on_delete=models.CASCADE, related_name="tictactoe_games"
    )
    opponent = models.CharField(max_length=20)
    board = ArrayField(
        ArrayField(
            models.CharField(max_length=1, blank=True),
            size=3,
        ),
        size=3,
    )
    current_player = models.CharField(max_length=1, default="X")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In Progress"
        DRAW = "draw", "Draw"
        WIN = "win", "Win"
        LOSS = "loss", "Loss"

    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
    )

    def __str__(self):
        return f"Game {self.id}: {self.user} vs {self.opponent} - {self.status}"
