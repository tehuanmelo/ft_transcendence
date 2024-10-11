import requests
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone


from .models import CustomUser
from .token import generate_token


def make_request(url, method="GET", headers=None, data=None):
    """
    Handles GET and POST requests with optional headers and data.
    :param url: The endpoint URL to request.
    :param method: HTTP method, either 'GET' or 'POST'.
    :param headers: Optional headers for the request.
    :param data: Optional data for POST requests.
    :return: Response JSON data or None if the request fails.
    """
    try:
        if method == "POST":
            response = requests.post(url, data=data, headers=headers)
        else:
            response = requests.get(url, headers=headers)

        response.raise_for_status()

        return response.json()
    except requests.RequestException as e:
        print(f"42_API_LOGIN: Request failed: {e}")
        return None


def exchange_access_token(code):
    app_details = {
        "grant_type": "authorization_code",
        "client_id": settings.API_42_CLIENT_ID,
        "client_secret": settings.API_42_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.API_42_REDIRECT_URI,
    }

    url = "https://api.intra.42.fr/oauth/token"
    responseJSON = make_request(url, method="POST", data=app_details)

    return responseJSON.get("access_token") if responseJSON else None


def login_or_create_42(access_token):
    url = "https://api.intra.42.fr/v2/me"
    headers = {"Authorization": f"Bearer {access_token}"}

    user_data = make_request(url, headers=headers)
    if user_data is None:
        return None

    user, created = CustomUser.objects.get_or_create(
        username=user_data.get("login"),
        email=user_data.get("email"),
        first_name=user_data.get("first_name"),
        last_name=user_data.get("last_name"),
    )

    if created:
        user.is_42 = True
        user.set_unusable_password()
        user.last_login = timezone.now()
        user.save()

    return user


def login_42(request):
    jwt_token = ""
    redirect_view = "login"
    auth_code = request.GET.get("code")

    if auth_code:
        access_token = exchange_access_token(auth_code)
        if access_token:
            user = login_or_create_42(access_token)
            if user:
                jwt_token = generate_token(user)
                redirect_view = "home"

    response = redirect(redirect_view)
    response.set_cookie("jwt", jwt_token, httponly=True, secure=True)

    return response
