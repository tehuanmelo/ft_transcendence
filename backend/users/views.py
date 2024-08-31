from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions
from .serializers import UserSerializer, UserDetailSerializer
from django.contrib.auth import authenticate, login

from .models import CustomUser

# the benifit of adding api_view is that it automatically converts
# request, and response to json
@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201) # created
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username:
        return Response({"error": "Username is required."}, status=400)
    if not password:
        return Response({"error": "Password is required."}, status=400)

    # need to authenticate if the user exists in the database
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Authentication success
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)
    else:
        # Authentication failed
        return Response({"error": "Invalid username or password."}, status=401)

class UsersDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = CustomUser.objects.all()
    serializer_class = UserDetailSerializer

class UsersListView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = CustomUser.objects.all()
    serializer_class = UserDetailSerializer