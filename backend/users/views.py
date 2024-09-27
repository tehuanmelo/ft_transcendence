import pyotp
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import redirect, render

from .auth import generate_2fa_key_qrcode, jwt_fetch_user, jwt_login_required
from .forms import CustomUserCreationForm, UserProfileForm
from .token import generate_token, set_property_token


@jwt_fetch_user
def reset_2fa_view(request):
    generate_2fa_key_qrcode(request.user)
    return redirect("verify_otp")


@jwt_fetch_user
def verify_otp_view(request):
    user = request.user
    error_message = None
    if request.method == "POST":
        otp = request.POST["otp"]
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        if totp.verify(otp):
            response = redirect("home")
            token = set_property_token(request, is_2fa_validated=True)
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
        else:
            error_message = "Invalid OTP"
    return render(request, "users/verify_otp.html", {"error_message": error_message})


@jwt_login_required
def disable_2fa(request):
    user = request.user
    response = redirect("settings")
    if request.method == "POST":
        user.is_2fa_set = False
        user.save()
        token = set_property_token(request, is_2fa_validated=True)
        response.set_cookie("jwt", token, httponly=True, secure=True)
        print("inside disable")
    return response


@jwt_login_required
def enable_2fa(request):
    user = request.user
    if not user.google_auth_key:
        generate_2fa_key_qrcode(user)
    error_message = None
    if request.method == "POST":
        otp = request.POST["otp"]
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        if totp.verify(otp):
            user.is_2fa_set = True  # set this variable for not showing the qrcode again
            user.save()
            response = redirect("settings")
            token = set_property_token(request, is_2fa_validated=True)
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
        else:
            error_message = "Invalid OTP"
    return render(
        request,
        "users/enable_2fa.html",
        {
            "error_message": error_message,
            "user": user,
        },
    )


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            user.save()
            if user.is_2fa_set:
                response = redirect("verify_otp")
            else:
                response = redirect("home")
            token = generate_token(user)
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
    else:
        form = AuthenticationForm()
    return render(request, "users/login.html", {"form": form})


@jwt_login_required
def logout_view(request):
    if request.method == "POST":
        print("inside psot logout")
        request.user.token_version += 1
        request.user.save()
        response = redirect("home")
        response.delete_cookie("jwt")
        return response
    else:
        return render(request, "users/logout.html")


@jwt_fetch_user
def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(data=request.POST)
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
