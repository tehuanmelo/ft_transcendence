import pyotp
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import redirect, render, get_object_or_404
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponseNotAllowed

from .models import CustomUser, Friendship
from .auth import (
    jwt_fetch_user,
    jwt_login_required,
    check_if_logged,
    generate_2fa_key,
    generate_2fa_qrcode,
    extract_token,
)
from .forms import CustomUserCreationForm, UserProfileForm
from .token import (
    generate_token,
    set_token_property,
    set_request_token_property,
)


@jwt_login_required
def reset_2fa_view(request):
    return redirect("enable_2fa")


@jwt_fetch_user
def verify_otp_view(request):
    user = request.user
    error_message = None
    if request.method == "POST":
        otp = request.POST["otp"]
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        if totp.verify(otp):
            user.last_login = timezone.now()
            user.save()
            response = redirect("home")
            token = set_request_token_property(
                request,
                is_2fa_validated=True,
                is_authenticated=True,
            )
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
        else:
            error_message = "Invalid OTP"
    return render(request, "users/verify_otp.html", {"error_message": error_message})


@jwt_login_required
def disable_2fa(request):
    user = request.user
    if not user.is_2fa_set:
        return redirect("settings")
    if request.method == "POST":
        response = redirect("settings")
        user.is_2fa_set = False
        user.google_auth_key = None
        user.save()
        token = set_request_token_property(
            request,
            is_2fa_validated=False,
            secret_key=None,
            qrcode=None,
        )
        response.set_cookie("jwt", token, httponly=True, secure=True)
    else:
        return HttpResponseNotAllowed(["POST"])
    return response


@jwt_login_required
def enable_2fa(request):
    user = request.user
    payload = extract_token(request)
    obj = {
        "qrcode": payload["qrcode"],
        "error_message": None,
    }

    if request.method == "POST":
        otp = request.POST["otp"]
        key = payload["secret_key"]
        qrcode = payload["qrcode"]
        totp = pyotp.TOTP(key)
        if totp.verify(otp):
            user.is_2fa_set = True
            user.google_auth_key = key
            user.qrcode_img.name = f"qr_codes/{qrcode}"
            user.save()
            response = redirect("settings")
            token = set_request_token_property(
                request,
                is_2fa_validated=True,
                secret_key=None,
                qrcode=None,
            )
            response.set_cookie("jwt", token, httponly=True, secure=True)
        else:
            obj["error_message"] = "Invalid OTP"
            response = render(request, "users/enable_2fa.html", {"obj": obj})
    else:
        secret_key = generate_2fa_key()
        qrcode = generate_2fa_qrcode(user, secret_key)
        token = set_request_token_property(
            request, secret_key=secret_key, qrcode=qrcode
        )
        obj["qrcode"] = qrcode

        response = render(request, "users/enable_2fa.html", {"obj": obj})
        response.set_cookie("jwt", token, httponly=True, secure=True)

    return response


@check_if_logged
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        print(f"the request POST is [{request.POST}]")
        if form.is_valid():
            user = form.get_user()
            token = generate_token(user)
            if user.is_2fa_set:
                response = redirect("verify_otp")
                token = set_token_property(token, is_authenticated=False)
            else:
                user.last_login = timezone.now()
                user.save()
                response = redirect("home")
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
    else:
        form = AuthenticationForm()
    return render(request, "users/login.html", {"form": form})


@jwt_login_required
def delete_account_view(request):
    if request.method == "POST":
        user = request.user
        user.delete()
        response = redirect("home")
        response.delete_cookie("jwt")
        return response


@jwt_login_required
def logout_view(request):
    if request.method == "POST":
        request.user.token_version += 1
        request.user.save()
        response = redirect("home")
        response.delete_cookie("jwt")

        # TODO fix logout
        # if request.user.is_42:
        #     user_intra = requests.get(
        #         "https://api.intra.42.fr/v2/me",
        #         headers={
        #             "Authorization": f"Bearer {access_token}",
        #         },
        #     )

        return response
    else:
        return HttpResponseNotAllowed(["POST"])


@check_if_logged
def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            form = AuthenticationForm()
            return redirect("login")
    else:
        form = CustomUserCreationForm()
    return render(request, "users/register.html", {"form": form})


@jwt_login_required
def profile_view(request):
    matches = request.user.get_all_matches()
    return render(request, "users/profile.html", {"matches": matches})


@jwt_login_required
def edit_profile_view(request):
    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("profile")
    else:
        form = UserProfileForm(instance=request.user)
    return render(request, "users/edit_profile.html", {"form": form})


@jwt_login_required
def change_password_view(request):

    user = request.user
    if request.method == "POST":
        old_password = request.POST.get("old_password")
        new_password = request.POST.get("new_password")
        confirm_password = request.POST.get("confirm_password")
        error = {
            "err_old_password": None,
            "err_new_password": None,
            "err_confirm_password": None,
            "err_invalid_password": None,
            "err_match_password": None,
        }
        if not old_password:
            error["err_old_password"] = "Old password is required."
        elif not new_password:
            error["err_new_password"] = "New password is required."
        elif not confirm_password:
            error["err_confirm_password"] = "Confirming password is required."
        elif not user.check_password(old_password):
            error["err_invalid_password"] = "Invalid old password."
        elif new_password != confirm_password:
            error["err_match_password"] = "Passwords do not match."
        else:
            try:
                validate_password(new_password, user=user)
                user.set_password(new_password)
                user.save()
                return redirect("settings")
            except ValidationError as e:
                return render(
                    request,
                    "users/change_password.html",
                    {"validation_error": e.messages},
                )

        return render(request, "users/change_password.html", {"error": error})

    return render(request, "users/change_password.html")


##############
##### Friends Methods
##############


@jwt_login_required
def add_friend(request, username):
    friend = get_object_or_404(CustomUser, username=username)
    request.user.add_friend(friend)
    return redirect("friend_list", username=username)


@jwt_login_required
def add_friend_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        friend = get_object_or_404(CustomUser, username=username)  # or filter by email
        request.user.add_friend(friend)
        return redirect("friend_list")  # Redirect to the friends list after adding

    return render(request, "users/add_friend.html")


@jwt_login_required
def remove_friend(request, username):
    friend = get_object_or_404(CustomUser, username=username)
    request.user.remove_friend(friend)
    return redirect("friend_list", username=username)


@jwt_login_required
def accept_friend(request, username):
    friend = get_object_or_404(CustomUser, username=username)  # Look up the user by username
    friendship = get_object_or_404(
        Friendship,
        user=request.user,
        friend=friend,  # Use the friend object instead of username
        status="pending",
    )
    friendship.status = "accepted"
    friendship.save()
    return redirect("friend_list")


@jwt_login_required
def reject_friend(request, username):
    friend = get_object_or_404(CustomUser, username=username)
    friendship = get_object_or_404(
        Friendship, user=request.user, friend=friend, status="pending"
    )
    friendship.delete()  # Remove the friendship request
    return redirect("friend_list")


@jwt_login_required
def friend_list(request):
    friends = request.user.get_friends()
    online_friends = request.user.get_online_friends()
    pending_requests = request.user.get_pending_requests()

    return render(
        request,
        "users/friend_list.html",
        {
            "friends": friends,
            "online_friends": online_friends,
            "pending_requests": pending_requests,
        },
    )


@jwt_login_required
def online_friends(request):
    online_friends = request.user.friendships.filter(
        friend__last_activity__gte=timezone.now() - timezone.timedelta(minutes=0.5)
    )
    return render(
        request, "users/online_friends.html", {"online_friends": online_friends}
    )


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
