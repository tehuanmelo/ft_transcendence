from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta


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
        self.user1.add_friend(self.user2)
        self.assertTrue(self.user1.is_friend(self.user2))
        self.assertFalse(self.user2.is_friend(self.user1))  # Friendship is not symmetrical

    def test_remove_friend(self):
        self.user1.add_friend(self.user2)
        self.user1.remove_friend(self.user2)
        self.assertFalse(self.user1.is_friend(self.user2))

    def test_get_friends(self):
        self.user1.add_friend(self.user2)
        self.user1.add_friend(self.user3)
        friends = self.user1.get_friends()
        self.assertEqual(friends.count(), 2)
        self.assertIn(self.user2, friends)
        self.assertIn(self.user3, friends)

    def test_get_online_friends(self):
        self.user1.add_friend(self.user2)
        self.user1.add_friend(self.user3)
        
        # Set user2 as online (active in the last 30 seconds)
        self.user2.last_activity = timezone.now()
        self.user2.save()
        
        # Set user3 as offline (inactive for more than 30 seconds)
        self.user3.last_activity = timezone.now() - timedelta(minutes=1)
        self.user3.save()
        
        online_friends = self.user1.get_online_friends()
        self.assertEqual(online_friends.count(), 1)
        self.assertIn(self.user2, online_friends)
        self.assertNotIn(self.user3, online_friends)

    def test_is_friend_online(self):
        friendship = self.user1.add_friend(self.user2)
        
        # Set user2 as online
        self.user2.last_activity = timezone.now()
        self.user2.save()
        self.assertTrue(friendship.is_friend_online)
        
        # Set user2 as offline
        self.user2.last_activity = timezone.now() - timedelta(minutes=1)
        self.user2.save()
        self.assertFalse(friendship.is_friend_online)
