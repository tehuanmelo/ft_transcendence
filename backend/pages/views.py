from django.shortcuts import render


def home(request):
    return render(request, 'pages/home.html')

def about(request):
    return render(request, 'pages/about.html')

def contact(request):
    return render(request, 'pages/contact.html')

def game(request):
    return render(request, 'pages/pong.html')