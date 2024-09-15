from django.shortcuts import render


def pong(request):
    return render(request, "pong/pong.html")
