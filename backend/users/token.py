import jwt, datetime, pytz

from django.conf import settings


def generate_token(**kwargs):
    utc = pytz.UTC
    expiration_time = datetime.datetime.now(utc) + datetime.timedelta(hours=1)
    payload = {}
    payload.update(kwargs)
    payload["exp"] = expiration_time
    print(payload)
    token = encode_payload(payload)
    return token


def decode_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Token is invalid


def encode_payload(payload):
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def add_property_token(token, **kwargs):
    payload = decode_token(token)
    payload.update(kwargs)
    print(payload)
    encoded_token = encode_payload(payload)
    return encoded_token


def get_token(request):
    token = request.COOKIES.get("jwt")
    return token
