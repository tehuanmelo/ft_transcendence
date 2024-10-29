from django.db import models
from django.contrib.postgres.fields import ArrayField


class Match(models.Model):
    user = models.ForeignKey(
        "users.CustomUser", related_name="matches", on_delete=models.CASCADE
    )
    opponents = ArrayField(
        models.CharField(max_length=20),
        # SIZE = 2 ; if there is a limit to Maximum opponents
        blank=True,
        default=list,
    )
    teammate = models.CharField(max_length=20, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class MatchResult(models.TextChoices):
        WIN = "win", "Win"
        DRAW = "draw", "Draw"
        LOSS = "loss", "Loss"

    result = models.CharField(
        max_length=10, choices=MatchResult.choices, default=MatchResult.LOSS
    )

    class GameMode(models.TextChoices):
        PONG_1V1 = "pong_1v1", "Pong 1v1"
        PONG_2V2 = "pong_2v2", "Pong 2v2"
        TICTACTOE = "tictactoe", "Tic Tac Toe"

    mode = models.CharField(
        max_length=20, choices=GameMode.choices, default=GameMode.PONG_1V1
    )

    @property
    def is_win(self):
        return self.MatchResult(self.result) == self.MatchResult.WIN

    def save(self, *args, **kwargs):
        # Ensure teammate is only set for pong_2v2
        if self.mode != self.GameMode.PONG_2V2:
            self.teammate = None

        super().save(*args, **kwargs)
        self.user.update_stats()

    def __str__(self):
        if self.mode == self.GameMode.PONG_2V2:
            return f"{self.user.username} and {self.teammate} vs {self.opponents[0]} and {self.opponents[1]} on {self.date}"
        elif (
            self.mode == self.GameMode.PONG_1V1 or self.mode == self.GameMode.TICTACTOE
        ):
            return f"{self.user.username} vs {self.opponents[0]} on {self.date}"
