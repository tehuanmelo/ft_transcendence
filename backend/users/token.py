import datetime

import jwt
import pytz
from django.conf import settings

from .models import CustomUser


def generate_token(user):
    utc = pytz.UTC
    expiration_time = datetime.datetime.now(utc) + datetime.timedelta(minutes=120)
    payload = {
        "user_id": user.id,
        "is_authenticated": True,
        "token_version": user.token_version,
        "is_2fa_validated": False,
        "exp": expiration_time,
        "secret_key": None,
        "qrcode": None,
    }
    token = encode_payload(payload)
    return token


def set_request_token_property(request, **kwargs):
    token = get_token(request)
    payload = decode_token(token)
    for key, value in kwargs.items():
        payload[key] = value

    encoded_token = encode_payload(payload)
    return encoded_token


def set_token_property(token, **kwargs):
    payload = decode_token(token)
    for key, value in kwargs.items():
        payload[key] = value
    encoded_token = encode_payload(payload)
    return encoded_token


def decode_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None  # Token has expired
    except jwt.InvalidTokenError:
        print("Invalid Token")
        return None  # Token is invalid
    except Exception as e:
        print(f"Token error: {e}")
        return None


def extract_token(request):
    token = get_token(request)
    if not token:
        raise ValueError("Token not found in request")
    payload = decode_token(token)
    if not payload:
        raise ValueError("Invalid token couldn't extract payload")
    return payload


def encode_payload(payload):
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def add_property_token(token, **kwargs):
    payload = decode_token(token)
    payload.update(kwargs)
    encoded_token = encode_payload(payload)
    return encoded_token


def get_token(request):
    token = request.COOKIES.get("jwt")
    return token
