from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions
from .serializers import UserSerializer, UserDetailSerializer
from django.contrib.auth import authenticate

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
    email = request.data.get('email')
    password = request.data.get('password')

    # need to authenticate if the user exists in the database
    user = authenticate(request, email=email, password=password)
    if user is not None:
        # Authentication success
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)
    else:
        # Authentication failed
        return Response({"error": "Invalid email or password."}, status=401)

class UsersDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = CustomUser.objects.all()
    serializer_class = UserDetailSerializer

class UsersListView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = CustomUser.objects.all()
    serializer_class = UserDetailSerializer
