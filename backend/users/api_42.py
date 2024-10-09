import requests
from .models import CustomUser
from .token import generate_token
from django.shortcuts import redirect


def exchange_access_token(code):
    if code is None:
        return redirect("login")

    app_details = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-bc495b0a5937ba6e8a1fe11be70a9446a8f7411e2587cd57046a356bb0467d3a",
        "client_secret": "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",
        "code": code,
        "redirect_uri": "https://localhost/users/login_42",
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
