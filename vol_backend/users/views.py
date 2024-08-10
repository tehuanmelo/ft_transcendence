from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer

# the benifit of adding api_view is that it automatically converts
# request, and response to json
@api_view(['POST'])
def register(request):
    print(request)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201) # created
    return Response(serializer.errors, status=400)
