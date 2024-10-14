from .auth import jwt_login_required

@jwt_login_required
def pending_requests(request):
    return {
        'pending_requests': request.user.get_pending_requests()
    }