from django.db import models
from .custom_user import CustomUser

class Match(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="matches", on_delete=models.CASCADE
    )
    opponent = models.CharField(
        max_length=255
    )
    date = models.DateTimeField(
        auto_now_add=True
    )  # Automatically set the date when the match is created
    class MatchResult(models.TextChoices):
        WIN = 'win', 'Win'
        LOSS = 'loss', 'Loss'

    result = models.CharField(
        max_length=10,
        choices=MatchResult.choices,
        default=MatchResult.LOSS,
    )

    @property
    def is_win(self):
        return self.MatchResult(self.result) == MatchResult.WIN

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.user.update_stats()

    def __str__(self):
        return f"{self.user.username} vs {self.opponent} on {self.date}"
