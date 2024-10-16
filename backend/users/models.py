from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db.models import Q


class CustomUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    profile_image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    bio = models.TextField(blank=True, null=True)
    github = models.URLField(max_length=200, blank=True, null=True)
    twitter = models.URLField(max_length=200, blank=True, null=True)
    nick_name = models.CharField(max_length=100, null=True, blank=True)
    google_auth_key = models.CharField(max_length=200, null=True, default=None)
    is_2fa_set = models.BooleanField(default=False)
    qrcode_img = models.ImageField(upload_to="qr_codes/", blank=True, null=True)
    token_version = models.IntegerField(default=0)
    is_authenticated = models.BooleanField(default=False)
    is_42 = models.BooleanField(default=False)
    last_activity = models.DateTimeField(default=timezone.now)
    friends = models.ManyToManyField(
        "self", through="Friendship", symmetrical=False, related_name="related_to"
    )
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    def add_friend(self, friend):
        friendship, created = Friendship.objects.get_or_create(user=self, friend=friend)
        return friendship

    def remove_friend(self, friend):
        Friendship.objects.filter(user=self, friend=friend).delete()
        return not self.is_friend(
            friend
        )

    def get_friends(self):
        return CustomUser.objects.filter(
            friendships__user=self, friendships__status="accepted"
        )

    def get_online_friends(self):
        return CustomUser.objects.filter(
            friendships__user=self,
            last_activity__gte=timezone.now() - timezone.timedelta(minutes=5),
            friendships__status="accepted",
        )

    def get_pending_requests(self):
        return CustomUser.objects.filter(
            friendships__friend=self, friendships__status="pending"
        )

    def is_friend(self, user):
        return Friendship.objects.filter(
            Q(user=self, friend=user) | Q(user=user, friend=self), status="accepted"
        ).exists()  # Check for mutual friendship

    def get_all_matches(self):
        """Retrieve all matches for this user."""
        return self.matches.all()  # Access matches through the related name


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


class Friendship(models.Model):
    user = models.ForeignKey(
        CustomUser,
        related_name="friendships",
        on_delete=models.CASCADE,
        to_field="username",
    )
    friend = models.ForeignKey(
        CustomUser,
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
