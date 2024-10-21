from django.db import models
from .custom_user import CustomUser


class Match(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="matches", on_delete=models.CASCADE
    )
    opponent = models.ForeignKey(
        CustomUser, related_name="opponent_matches", on_delete=models.CASCADE
    )
    date = models.DateTimeField(
        auto_now_add=True
    )  # Automatically set the date when the match is created
    result = models.CharField(max_length=10)  # 'win' or 'loss'

    def __str__(self):
        return f"{self.user.username} vs {self.opponent.username} on {self.date}"
