from .auth import jwt_login_required

def pending_requests(request):
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        return {'pending_requests': request.user.get_pending_requests()}
    return {'pending_requests': []} 
