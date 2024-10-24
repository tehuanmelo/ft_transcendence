from django.db import models
from django.utils import timezone


class Friendship(models.Model):
    user = models.ForeignKey(
        "users.CustomUser",
        related_name="friendships",
        on_delete=models.CASCADE,
        to_field="username",
    )
    friend = models.ForeignKey(
        "users.CustomUser",
        related_name="friend_of",
        on_delete=models.CASCADE,
        to_field="username",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, default="pending")

    class Meta:
        unique_together = ["user", "friend"]

    def __str__(self):
        return f"{self.user} is friends with {self.friend} ({self.status})"

    @property
    def is_friend_online(self):
        # Consider a user online if their last activity was within the last .5 minute
        return (timezone.now() - self.friend.last_activity) < timezone.timedelta(
            minutes=5
        )
