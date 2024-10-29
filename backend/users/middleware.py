from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist


class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if (
            hasattr(request, "user")
            and request.user is not None
            and request.user.is_authenticated
        ):
            User = get_user_model()
            try:
                user = User.objects.get(pk=request.user.pk)
                user.last_activity = timezone.now()
                user.save(update_fields=["last_activity"])
            except ObjectDoesNotExist:
                pass
        return response
