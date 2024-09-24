import pyotp, qrcode, os

from django.shortcuts import redirect
from django.conf import settings

from .models import CustomUser
from .token import decode_token, get_token


def generate_2fa_key_qrcode(user):
    secret = pyotp.random_base32()
    qrcode_url = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.username, issuer_name="PONG"
    )

    file_path = os.path.join(
        settings.MEDIA_ROOT, "qr_codes", f"{user.username}_qrcode.png"
    )
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    qrcode.make(qrcode_url).save(file_path)

    user.google_auth_key = secret
    user.qrcode_img.name = f"qr_codes/{user.username}_qrcode.png"
    user.is_2fa_set = False
    user.save()


def jwt_required(func):
    def wrapper(request, *args, **kwargs):
        try:
            print("inside try")
            token = get_token(request)
            payload = decode_token(token)
            print(payload)
            user = CustomUser.objects.get(id=payload["user_id"])
            request.user = user
            token_version = payload["version"]
            print(f"this is the {token_version}")
            if token_version != user.token_version:
                return redirect("login")
        except:
            return redirect("login")
        return func(request, *args, **kwargs)

    return wrapper


def fetch_user(func):
    def wrapper(request, *args, **kwargs):
        user = None
        token = request.COOKIES.get("jwt")
        if token:
            payload = decode_token(token)
            user = CustomUser.objects.get(id=payload["user_id"])
        request.user = user
        return func(request, *args, **kwargs)

    return wrapper
