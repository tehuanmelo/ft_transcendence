from ..models import CustomUser, Match
from ..auth import jwt_login_required


# game can be:
## pong 1v1
## pong 2v2
## tictactoe
# no tournament saving!

# format of the db:
# DATE & TIME | GAME_ID | GAME | PLAYERS | SCORE | WINNER


@jwt_login_required
def save_match_result(winner, loser):
    winner.wins += 1
    loser.losses += 1
    winner.save()
    loser.save()

    Match.objects.create(user=winner, opponent=loser)
    Match.objects.create(user=loser, opponent=winner)
