from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    # path('<int:pk>/', views.UsersDetailView.as_view()),
    # path('list/', views.UsersListView.as_view()),
]