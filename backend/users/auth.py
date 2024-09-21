
import pyotp, qrcode, os, jwt, datetime, pytz

from django.shortcuts import redirect
from django.conf import settings

from .models import CustomUser


def generate_2fa_key_qrcode(user):
    secret = pyotp.random_base32()
    qrcode_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="PONG")
    
    file_path = os.path.join(settings.MEDIA_ROOT, 'qr_codes', f'{user.username}_qrcode.png')
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    qrcode.make(qrcode_url).save(file_path)
    
    user.google_auth_key = secret
    user.qrcode_img.name = f'qr_codes/{user.username}_qrcode.png'
    user.is_2fa_set = False
    user.save()
    
     
def generate_jwt(user):
    utc = pytz.UTC
    expiration_time = datetime.datetime.now(utc) + datetime.timedelta(hours=1)
    payload = {
        'user_id': user.id,
        'username': user.username,
        'token_version': user.token_version,
        'exp': expiration_time
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def jwt_required(func):
    def wrapper(request, *args, **kwargs):
        try:
            jwt_token = request.COOKIES["jwt"]
            payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
            user = CustomUser.objects.get(id=payload["user_id"])
            request.user = user
            token_version = payload["token_version"]
            if token_version != user.token_version:
                return redirect("login")
        except:
            return redirect("login")
        return func(request, *args, **kwargs)
    return wrapper

def user_id_required(func):
    def wrapper(request, *args, **kwargs):
        try:
            user_id = request.session['user_id']
            user = CustomUser.objects.get(id=user_id)
            request.user = user
        except:
            return redirect("login")
        return func(request, *args, **kwargs)
    return wrapper