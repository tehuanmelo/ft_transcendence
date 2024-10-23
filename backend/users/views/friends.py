from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.db.models import Q

from ..models import CustomUser, Friendship
from ..auth import jwt_login_required


@jwt_login_required
def friends(request):
    friends = request.user.get_friends()
    online_friends = request.user.get_online_friends()
    pending_requests = request.user.get_pending_requests()

    return render(
        request,
        "users/friends.html",
        {
            "friends": friends,
            "online_friends": online_friends,
            "pending_requests": pending_requests,
        },
    )


@jwt_login_required
def add_friend(request, username):
    friend = CustomUser.objects.filter(username=username).first()
    error_message = None
    status = 200

    if not friend:
        print("user not found")
        error_message = "User not found."
        status = 404
    elif friend == request.user:
        error_message = "You cannot add yourself as a friend."
        status = 400
    else:
        request.user.add_friend(friend)

    if error_message:
        return JsonResponse({"error_message": error_message}, status=status)

    return redirect("friends")


@jwt_login_required
def remove_friend(request, username):
    friend = CustomUser.objects.filter(username=username).first()
    error_message = None
    status = 200

    if not friend:
        error_message = "User not found."
    else:
        # Remove the friendship from both sides
        friendship = Friendship.objects.filter(
            Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)
        )

        if not friendship.exists():
            error_message = "Friendship not found."
            status = 404
        else:
            friendship.delete()

    if error_message:
        return JsonResponse({"error_message": error_message}, status=status)

    return redirect("friends")


@jwt_login_required
def accept_friend(request, username):
    friend = CustomUser.objects.filter(username=username).first()
    error_message = None
    status = 200

    if not friend:
        error_message = "User not found."
        status = 404
    else:
        # Find the pending friendship request
        friendship = Friendship.objects.filter(
            user=friend, friend=request.user, status="pending"
        ).first()

        if not friendship:
            error_message = "No pending friendship request found."
            status = 400
        else:
            # Accept the friendship
            friendship.status = "accepted"
            friendship.save()

            # Ensure mutual friendship
            reciprocal_friendship, created = Friendship.objects.get_or_create(
                user=request.user, friend=friend
            )
            if created:
                reciprocal_friendship.status = "accepted"
                reciprocal_friendship.save()

    if error_message:
        return JsonResponse({"error_message": error_message}, status=status)

    return redirect("friends")


@jwt_login_required
def reject_friend(request, username):
    friend = CustomUser.objects.filter(username=username).first()
    error_message = None
    status = 200

    if not friend:
        error_message = "User not found."
        status = 404
    else:
        # Find the pending friendship request
        friendship = Friendship.objects.filter(
            user=friend, friend=request.user, status="pending"
        ).first()

        if not friendship:
            error_message = "No pending friendship request found."
        else:
            # Reject the friendship
            friendship.delete()

    if error_message:
        return JsonResponse({"error_message": error_message}, status=status)

    return redirect("friends")


##############
##### Match Record Methods
##############


@jwt_login_required
def record_match_result(winner, loser):
    winner.wins += 1
    loser.losses += 1
    winner.save()
    loser.save()

    Match.objects.create(user=winner, opponent=loser)
    Match.objects.create(user=loser, opponent=winner)
