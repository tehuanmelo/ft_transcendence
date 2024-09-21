
import pyotp

from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect

from .forms import CustomUserCreationForm, UserProfileForm
from .auth import generate_jwt, generate_2fa_key_qrcode, jwt_required, user_id_required



@user_id_required
def reset_2fa_view(request):
    generate_2fa_key_qrcode(request.user)
    return redirect("verify_otp")
   
    
@user_id_required
def verify_otp_view(request):
    
    user = request.user
    obj = {
        "error": False,
        "error_message": "Invalid OTP",
        "user": user
    }
    
    if request.method == "POST":
        
        otp = request.POST['otp']
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        
        if totp.verify(otp):
            login(request, user)
            # set the variable to true for not showing the qrcode again
            user.is_2fa_set = True 
            user.save()
            
            token = generate_jwt(user)
            print(token)
            response = redirect("home")
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
        else:
            obj["error"] = True
    
    return render(request, "users/two_fact_auth.html", obj)
            
          
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            request.session['user_id'] = user.id
            if not user.google_auth_key:
                generate_2fa_key_qrcode(user)
            return redirect("verify_otp")
    else:
        form = AuthenticationForm()

    return render(request, "users/login.html", {"form": form})


@jwt_required
def logout_view(request):
    if request.method == "POST":
        request.user.token_version += 1
        request.user.save()
        logout(request)
        response = redirect("home")
        response.delete_cookie("jwt")
        return response
    else:
        return render(request, "users/logout.html")


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
