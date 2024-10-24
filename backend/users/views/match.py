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
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Extract the relevant data from the incoming request
            game = data.get('game')
            mode = data.get('mode')
            # winners/losers can be 1 or 2 players (only 1 player will be logged in tho)
            winner_id = data.get('winners')[0]
            loser_id = data.get('losers')[0]

            # need to determine who the request.user is, winner or loser
            # results should be saved to that specific user

            return JsonResponse({'status': 'success', 'message': 'Match result saved successfully'})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
