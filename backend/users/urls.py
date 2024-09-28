from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register_view, name="register"),
    path("profile/", views.profile_view, name="profile"),
    path("profile/edit/", views.edit_profile_view, name="edit_profile"),
    path("2fa/verify", views.verify_otp_view, name="verify_otp"),
    path("2fa/enable", views.enable_2fa, name="enable_2fa"),
    path("2fa/disable", views.disable_2fa, name="disable_2fa"),
    path("2fa/reset", views.reset_2fa_view, name="reset_2fa"),
    path("change_password/", views.change_password_view, name="change_password"),
]
