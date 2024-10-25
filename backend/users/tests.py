from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from users.models import CustomUser, Match


class CustomUserTests(TestCase):

    def test_create_user(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="tehuan",
            email="tehuan@email.com",
            password="testpass123",
        )
        self.assertEqual(user.username, "tehuan")
        self.assertEqual(user.email, "tehuan@email.com")
        self.assertTrue(
            user.check_password(
                "testpass123",
            )
        )
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        User = get_user_model()
        admin_user = User.objects.create_superuser(
            username="superadmin",
            email="superadmin@email.com",
            password="testpass123",
        )
        self.assertEqual(admin_user.username, "superadmin")
        self.assertEqual(admin_user.email, "superadmin@email.com")
        self.assertTrue(
            admin_user.check_password(
                "testpass123",
            )
        )
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_set_display_name(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="tehuan",
            email="tehuan@email.com",
            password="testpass123",
        )
        user.display_name = "Tehuan Melo"
        user.save()
        self.assertEqual(user.display_name, "Tehuan Melo")


class FriendshipTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user1 = User.objects.create_user(
            username="user1",
            email="user1@email.com",
            password="testpass123",
        )
        self.user2 = User.objects.create_user(
            username="user2",
            email="user2@email.com",
            password="testpass123",
        )
        self.user3 = User.objects.create_user(
            username="user3",
            email="user3@email.com",
            password="testpass123",
        )

    def test_add_friend(self):
        # User1 sends a friend request to User2
        friendship = self.user1.add_friend(self.user2)
        self.assertEqual(friendship.status, "pending")
        self.assertFalse(self.user1.is_friend(self.user2))  # Not friends yet

    def test_accept_friend(self):
        # User1 sends a friend request to User2
        friendship = self.user1.add_friend(self.user2)
        self.assertEqual(friendship.status, "pending")

        # User2 accepts the friend request using username
        self.user2.accept_friend(self.user1.username)
        friendship.refresh_from_db()
        self.assertEqual(friendship.status, "accepted")
        self.assertTrue(self.user1.is_friend(self.user2))  # Now they are friends

    def test_reject_friend(self):
        # User1 sends a friend request to User2
        friendship = self.user1.add_friend(self.user2)
        self.assertEqual(friendship.status, "pending")

        # User2 rejects the friend request using username
        self.user2.reject_friend(self.user1.username)
        self.assertFalse(
            Friendship.objects.filter(user=self.user1, friend=self.user2).exists()
        )
        self.assertFalse(self.user1.is_friend(self.user2))  # Not friends anymore

    def test_remove_friend(self):
        # User1 sends a friend request to User2 and accepts it
        friendship = self.user1.add_friend(self.user2)
        self.user2.accept_friend(self.user1.username)
        self.assertTrue(self.user1.is_friend(self.user2))  # They are friends

        # User1 removes User2 as a friend
        self.user1.remove_friend(self.user2)
        self.assertFalse(self.user1.is_friend(self.user2))  # Not friends anymore

    def test_get_friends(self):
        # User1 sends friend requests to User2 and User3
        self.user1.add_friend(self.user2)
        self.user1.add_friend(self.user3)

        # User2 accepts the friend request
        self.user2.accept_friend(self.user1.username)

        # Check the friends list
        friends = self.user1.get_friends()
        self.assertEqual(friends.count(), 1)  # Only User2 should be in the friends list
        self.assertIn(self.user2, friends)
        self.assertNotIn(self.user3, friends)  # User3 is not accepted yet

    def test_get_online_friends(self):
        # User1 sends a friend request to User2 and User3
        self.user1.add_friend(self.user2)
        self.user1.add_friend(self.user3)

        # User2 accepts the friend request
        self.user2.accept_friend(self.user1.username)

        # Simulate last activity for User2
        self.user2.last_activity = timezone.now()  # User2 is online
        self.user2.save()

        # User3 does not accept the request, so they should not be online
        self.user3.last_activity = timezone.now() - timezone.timedelta(
            minutes=10
        )  # User3 is offline
        self.user3.save()

        # Check online friends
        online_friends = (
            self.user1.get_online_friends()
        )  # Using get_online_friends method
        self.assertEqual(online_friends.count(), 1)  # Only User2 should be online
        self.assertIn(self.user2, online_friends)
        self.assertNotIn(
            self.user3, online_friends
        )  # User3 is not accepted and not online


class MatchModelTest(TestCase):

    def setUp(self):
        # Create a user for testing
        self.user1 = CustomUser.objects.create_user(
            username="user1", email="user1@example.com", password="password123"
        )
        self.opponents = ["opponent_user"]  # Use a list for the opponents

    def test_create_match(self):
        # Test creating a match
        match = self.user1.create_match(
            opponents=self.opponents, result=Match.MatchResult.WIN
        )
        self.assertEqual(match.user, self.user1)
        self.assertEqual(match.opponents, self.opponents)
        self.assertEqual(match.result, Match.MatchResult.WIN)
        self.assertTrue(match.date <= timezone.now())

    def test_update_stats_on_match_creation(self):
        # Test that stats are updated when a match is created
        self.user1.create_match(opponents=self.opponents, result=Match.MatchResult.WIN)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.wins, 1)
        self.assertEqual(self.user1.losses, 0)

    def test_create_match_against_self(self):
        # Test that a user cannot play a match against themselves
        with self.assertRaises(ValueError):
            self.user1.create_match(opponents=[self.user1.username])

    def test_get_all_matches(self):
        # Test retrieving all matches for a user
        match1 = self.user1.create_match(
            opponents=self.opponents, result=Match.MatchResult.WIN
        )
        match2 = self.user1.create_match(
            opponents=["another_opponent"], result=Match.MatchResult.LOSS
        )
        matches_user1 = self.user1.get_all_matches()
        self.assertIn(match1, matches_user1)
        self.assertIn(match2, matches_user1)
