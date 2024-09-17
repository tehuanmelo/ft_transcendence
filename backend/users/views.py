from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

from .forms import CustomUserCreationForm, UserProfileForm


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect("home")
    else:
        form = AuthenticationForm()

    return render(request, "users/login.html", {"form": form})


@login_required
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return redirect("home")
    else:
        return render(request, "users/logout.html")


def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(data=request.POST)

        if form.is_valid():
            form.save()
            form = AuthenticationForm()
            return redirect("login")
    else:
        form = CustomUserCreationForm()

    return render(request, "users/register.html", {"form": form})


@login_required
def profile_view(request):
    return render(request, "users/profile.html")


def edit_profile_view(request):
    if request.method == "POST":
        print("request is a post")
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("profile")
    else:
        form = UserProfileForm(instance=request.user)

    return render(request, "users/edit_profile.html", {"form": form})
