from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth import authenticate

# the benifit of adding api_view is that it automatically converts
# request, and response to json
@api_view(['POST'])
def register(request):
    # print(request)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201) # created
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    # need to authenticate if the user exists in the database
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Authentication success
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)
    else:
        # Authentication failed
        return Response(serializer.data, status=400)
