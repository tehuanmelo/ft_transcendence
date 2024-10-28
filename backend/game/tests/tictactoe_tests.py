from django.test import TestCase, Client
from django.urls import reverse
from .models import TicTacToeGame


class TicTacToeGameTests(TestCase):
    def setUp(self):
        self.client = Client()
        User = get_user_model()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.opponent_name = "opponent"
        self.client.login(username="testuser", password="testpass")

    def test_create_game(self):
        response = self.client.post(
            reverse("create_game"), {"opponent_name": self.opponent_name}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("game_id", response.json())
        self.assertIn("board", response.json())
        self.assertIn("current_player", response.json())

    def test_make_move(self):
        # First, create a game
        create_response = self.client.post(
            reverse("create_game"), {"opponent_name": self.opponent_name}
        )
        game_id = create_response.json()["game_id"]

        # Make a move
        move_response = self.client.post(
            reverse("make_move", args=[game_id]),
            {"row": 0, "col": 0, "current_player": "X"},
        )
        self.assertEqual(move_response.status_code, 200)
        self.assertEqual(move_response.json()["board"][0][0], "X")
        self.assertEqual(move_response.json()["current_player"], "O")
        self.assertIsNone(move_response.json()["winner"])

    def test_invalid_move(self):
        # Create a game
        create_response = self.client.post(
            reverse("create_game"), {"opponent_name": self.opponent_name}
        )
        game_id = create_response.json()["game_id"]

        # Make a valid move
        self.client.post(
            reverse("make_move", args=[game_id]),
            {"row": 0, "col": 0, "current_player": "X"},
        )

        # Attempt to make an invalid move (same spot)
        invalid_move_response = self.client.post(
            reverse("make_move", args=[game_id]),
            {"row": 0, "col": 0, "current_player": "O"},
        )
        self.assertEqual(invalid_move_response.status_code, 200)
        self.assertEqual(
            invalid_move_response.json()["board"][0][0], "X"
        )  # Should remain 'X'
