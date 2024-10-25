from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from ..models import Match
from ..auth import jwt_login_required


@jwt_login_required
def save_match_result(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            mode = data.get("mode")
            winners = data.get("winners")
            losers = data.get("losers")
            score_data = data.get("scores")

            if not winners or not losers:
                return JsonResponse({"error": "Missing players data"}, status=400)

            if not mode:
                return JsonResponse({"error": "Missing game mode"}, status=400)

            if mode not in dict(Match.GameMode.choices):
                return JsonResponse({"error": "Invalid game mode"}, status=400)

            if mode == "pong_2v2":
                if len(winners) != 2 or len(losers) != 2:
                    return JsonResponse(
                        {"error": "2v2 mode requires 2 winners and 2 losers"},
                        status=400,
                    )

                # Determine if the logged-in user is part of the winners or losers
                if request.user.username in winners:
                    result = Match.MatchResult.WIN
                    teammate = (
                        winners[1]
                        if winners[0] == request.user.username
                        else winners[0]
                    )
                    opponents = losers
                elif request.user.username in losers:
                    result = Match.MatchResult.LOSS
                    teammate = (
                        losers[1] if losers[0] == request.user.username else losers[0]
                    )
                    opponents = winners
                else:
                    return JsonResponse(
                        {"error": "Logged-in user not part of the match"}, status=400
                    )

                # Create the match entry
                Match.objects.create(
                    user=request.user,
                    opponents=opponents,
                    teammate=teammate,
                    result=result,
                    score=f"{score_data['left']}-{score_data['right']}",
                    mode=mode,
                )
            else:  # Handle 1v1 and tictactoe
                if len(winners) != 1 or len(losers) != 1:
                    return JsonResponse(
                        {
                            "error": "1v1 and tictactoe modes require 1 winner and 1 loser"
                        },
                        status=400,
                    )

                winner_name = winners[0]
                loser_name = losers[0]

                if request.user.username == winner_name:
                    result = Match.MatchResult.WIN
                    opponents = [loser_name]
                else:
                    result = Match.MatchResult.LOSS
                    opponents = [winner_name]

                # Create the match entry
                Match.objects.create(
                    user=request.user,
                    opponents=opponents,
                    result=result,
                    score=f"{score_data['left']}-{score_data['right']}",
                    mode=mode,
                )

            return JsonResponse(
                {"status": "success", "message": "Match result saved successfully"}
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
