from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
import pyotp, qrcode
import os
from django.conf import settings


from .forms import CustomUserCreationForm, CustomUserChangeForm, UserProfileForm
from .models import CustomUser

def generate_key_qrcode(user):
    
    secret = pyotp.random_base32()
    qrcode_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="PONG")
    
    file_path = os.path.join(settings.MEDIA_ROOT, 'qr_codes', f'{user.username}_qrcode.png')
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    qrcode.make(qrcode_url).save(file_path)
    
    user.google_auth_key = secret
    user.is_2fa_set = True
    user.qrcode_img.name = f'qr_codes/{user.username}_qrcode.png'
    user.save()

  
def verify_otp(request):
    if request.method == "POST":
        
        user_id = request.session['user_id']
        user = CustomUser.objects.get(id=user_id)
        del request.session["user_id"]
        
        otp = request.POST['otp']
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        
        if totp.verify(otp, valid_window=1):
            login(request, user)
            return render(request, "pages/home.html")
        
    return render(request, "users/two_fact_auth.html", {
        "error": "invalid otp",
        "user": user,
    })
     
    
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)

        if form.is_valid():
            user = form.get_user()
            request.session['user_id'] = user.id
            if not user.is_2fa_set:
                generate_key_qrcode(user)
                
            return render(request, 'users/two_fact_auth.html', {
                "user": user,
            })
            
                
    else:
        form = AuthenticationForm()

    return render(request, "users/login.html", {"form": form})


@login_required
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return render(request, "pages/home.html")
    else:
        return render(request, "users/logout.html")


def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(data=request.POST)

        if form.is_valid():
            form.save()
            form = AuthenticationForm()
            return render(request, "users/login.html", {"form": form})
    else:
        form = CustomUserCreationForm()

    return render(request, "users/register.html", {"form": form})


@login_required
def profile_view(request):
    return render(
        request,
        "users/profile.html",
        {
            "user": request.user,
        },
    )


def edit_profile_view(request):
    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return render(request, "users/profile.html")
    else:
        form = UserProfileForm(instance=request.user)

    return render(request, "users/edit_profile.html", {"form": form})
