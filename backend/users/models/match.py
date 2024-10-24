from django.db import models


class Match(models.Model):
    user = models.ForeignKey(
        "users.CustomUser", related_name="matches", on_delete=models.CASCADE
    )
    opponent1 = models.CharField(max_length=20)
    opponent2 = models.CharField(max_length=20, blank=True, null=True)
    teammate = models.CharField(max_length=20, blank=True, null=True)
    score = models.CharField(max_length=20)
    date = models.DateTimeField(auto_now_add=True)

    class MatchResult(models.TextChoices):
        WIN = "win", "Win"
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
        # Ensure opponent2 and teammate are only set for pong_2v2
        if self.mode != self.GameMode.PONG_2V2:
            self.opponent2 = None
            self.teammate = None

        super().save(*args, **kwargs)
        self.user.update_stats()

    def __str__(self):
        if self.mode == self.GameMode.PONG_2V2:
            return f"{self.user.username} and {self.teammate} vs {self.opponent1} and {self.opponent2} on {self.date}"
        elif (
            self.mode == self.GameMode.PONG_1V1 or self.mode == self.GameMode.TICTACTOE
        ):
            return f"{self.user.username} vs {self.opponent1} on {self.date}"
