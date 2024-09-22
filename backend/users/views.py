
import pyotp

from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect

from .forms import CustomUserCreationForm, UserProfileForm
from .auth import generate_2fa_key_qrcode, jwt_required, fetch_user
from .token import generate_token, get_token, add_property_token


@fetch_user
def reset_2fa_view(request):
    generate_2fa_key_qrcode(request.user)
    return redirect("verify_otp")
   
   
@fetch_user
def verify_otp_view(request):
    user = request.user
    error_message = None
    if request.method == "POST":
        otp = request.POST['otp']
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        if totp.verify(otp):
            user.is_2fa_set = True # set this variable for not showing the qrcode again
            user.is_authenticated = True
            user.save()
            response = redirect("home")
            token = get_token(request)
            new_token = add_property_token(token, authenticated=True, version=user.token_version)
            response.set_cookie('jwt', new_token, httponly=True, secure=True)
            return response
        else:
            error_message = "Invalid OTP"
    return render(request, "users/two_fact_auth.html", {
        "error_message": error_message,
        "user": user,
    })
    
       
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if not user.google_auth_key:
                generate_2fa_key_qrcode(user)
            response = redirect('verify_otp')
            token = generate_token(user_id=user.id)
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
    else:
        form = AuthenticationForm()
    return render(request, "users/login.html", {"form": form})


@jwt_required
def logout_view(request):
    if request.method == "POST":
        request.user.token_version += 1
        request.user.save()
        response = redirect("home")
        response.delete_cookie("jwt")
        return response
    else:
        return render(request, "users/logout.html")


@fetch_user
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



@jwt_required
def profile_view(request):
    return render(request, "users/profile.html")


@jwt_required
def edit_profile_view(request):
    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("profile")
    else:
        form = UserProfileForm(instance=request.user)
    return render(request, "users/edit_profile.html", {"form": form})
