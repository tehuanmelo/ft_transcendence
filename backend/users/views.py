import pyotp
import datetime
import pytz
import requests
from django.db import models
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import redirect, render
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponseNotAllowed

from .models import CustomUser
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

# REVIEW looks like all auth is not needed
# from allauth.socialaccount.helpers import complete_social_login  # To handle social login completion
# from django.urls import reverse
# from allauth.socialaccount.providers.oauth2.views import OAuth2LoginView


@jwt_login_required
def reset_2fa_view(request):
    return redirect("enable_2fa")


# Exchange authorization code for access token
def exchange_code(request):
    # We have "code"
    code = request.GET.get("code")
    if code is None:
        return redirect("login")

    # Response OBJECT
    exchange_endpoint = "https://api.intra.42.fr/oauth/token"
    client_uid = (
        "u-s4t2ud-bc495b0a5937ba6e8a1fe11be70a9446a8f7411e2587cd57046a356bb0467d3a"
    )
    client_secret = (
        "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"
    )
    redirect_uri = "https://localhost/users/exchange_code"

    # ANCHOR SEND POST
    api_response = requests.post(
        exchange_endpoint,
        data={
            "grant_type": "authorization_code",
            "client_id": client_uid,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        },
    )

    if api_response.status_code != 200:
            return redirect("login") # Return Early 
    token_data = api_response.json()
    access_token = token_data.get("access_token")

    user_intra = requests.get(
        "https://api.intra.42.fr/v2/me",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    if user_intra.status_code != 200:
        return redirect("login") # Return Early 

    user_data = user_intra.json()
    user_42login = user_data.get("login") # user name
    # all the required fields
    print(f"User login name is [{user_42login}]")

    if not user_42login:
        return redirect("home")  # ANCHOR not the right redirect

    user, created = CustomUser.objects.get_or_create(
        username=user_42login,
    )

    if created:
        user.is_42 = True
        user.set_unusable_password()

    user.save()
    token = generate_token(user)

    response = redirect("home")
    response.set_cookie("jwt", token, httponly=True, secure=True)

    return response


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
    return render(request, "users/profile.html")


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
