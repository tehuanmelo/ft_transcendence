from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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
def save_match_result(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            mode = data.get("mode")
            winners = data.get("winners")
            losers = data.get("losers")

            if not winners or not losers:
                return JsonResponse({"error": "Missing players data"}, status=400)

            if not mode:
                return JsonResponse({"error": "Missing game mode"}, status=400)

            if mode not in dict(Match.GameMode.choices):
                return JsonResponse({"error": "Invalid game mode"}, status=400)

            winner_name = winners[0]
            loser_name = losers[0]

            # Determine if the logged-in user is the winner or loser
            if request.user.username == winner_name:
                result = Match.MatchResult.WIN
                opponent = loser_name
            else:
                result = Match.MatchResult.LOSS
                opponent = winner_name

            match = Match.objects.create(
                user=request.user,
                opponent=opponent,
                result=result,
                mode=mode,
            )

            return JsonResponse(
                {"status": "success", "message": "Match result saved successfully"}
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
