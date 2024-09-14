from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

from .forms import CustomUserCreationForm, CustomUserChangeForm, UserProfileForm
from .models import CustomUser

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        # print(request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return render(request, "pages/home.html")
    else:
        form = AuthenticationForm()

    return render(request, 'users/login.html', {'form': form})

@login_required
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return render(request, "pages/home.html")
    else:
        return render(request, "users/logout.html")


def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(data=request.POST)

        if form.is_valid():
            form.save()
            form = AuthenticationForm()
            return render(request, "users/login.html", {'form': form})
    else:
        form = CustomUserCreationForm()

    return render(request, 'users/register.html', {'form': form})

@login_required
def profile_view(request):
    return render(request, "users/profile.html", {
        "user": request.user,
    })
 
def edit_profile_view(request):
    print('request is in edit')
    if request.method == 'POST':
        print('request is a post')
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return render(request, 'users/profile.html')
    else:
        form = UserProfileForm(instance=request.user)
            
    return render(request, 'users/edit_profile.html', {'form': form})
            