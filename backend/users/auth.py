import os

import pyotp
import qrcode
from django.conf import settings
from django.shortcuts import redirect

from .models import CustomUser
from .token import decode_token, get_token, extract_token


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


def jwt_login_required(func):
    def wrapper(request, *args, **kwargs):
        try:
            payload = extract_token(request)
            user = CustomUser.objects.get(id=payload["user_id"])
            request.user = user
            request.user.is_authenticated = payload["is_authenticated"]
            token_version = payload["token_version"]
            if token_version != user.token_version:
                return redirect("login")
            if user.is_2fa_set:
                if not payload.get("is_2fa_validated"):
                    return redirect("verify_otp")
        except ValueError as err:
            print(f"ValueError: {err}")
            return redirect("login")
        except:
            return redirect("login")
        return func(request, *args, **kwargs)

    return wrapper


def jwt_fetch_user(func):
    def wrapper(request, *args, **kwargs):
        try:
            payload = extract_token(request)
            user = CustomUser.objects.get(id=payload["user_id"])
            token_version = payload["token_version"]
            if token_version == user.token_version:
                request.user = user
                request.user.is_authenticated = payload["is_authenticated"]
        except ValueError as err:
            request.user = None
            print(f"ValueError: {err}")
        except:
            request.user = None
        return func(request, *args, **kwargs)

    return wrapper
