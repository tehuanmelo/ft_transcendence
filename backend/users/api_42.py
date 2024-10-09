import requests
from .models import CustomUser
from .token import generate_token
from django.shortcuts import redirect
from django.conf import settings


def exchange_access_token(code):
    if code is None:
        return redirect("login")

    app_details = {
        "grant_type": "authorization_code",
        "client_id": settings.API_42_CLIENT_ID,
        "client_secret": settings.API_42_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.API_42_REDIRECT_URI,
    }

    response = requests.post(
        "https://api.intra.42.fr/oauth/token",
        app_details,
    )

    if response.status_code != 200:
        return redirect("login")

    access_token = response.json().get("access_token")

    return access_token


def get_user_details(access_token):
    user_details = requests.get(
        "https://api.intra.42.fr/v2/me",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    if user_details.status_code != 200:
        return redirect("login")

    return user_details.json()


def login_or_create_42(username):
    user, created = CustomUser.objects.get_or_create(username=username)

    if created:
        user.is_42 = True
        user.set_unusable_password()

    user.save()
    token = generate_token(user)
    return token


def login_42(request):
    code = request.GET.get("code")

    access_token = exchange_access_token(code)

    user_data = get_user_details(access_token)
    login_42 = user_data.get("login")  # user name

    token = login_or_create_42(login_42)

    response = redirect("home")
    response.set_cookie("jwt", token, httponly=True, secure=True)

    return response
