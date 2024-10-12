from django.urls import path
from . import views, api_42

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
    path("login_42/", api_42.login_42, name="login_42"),
    path("change_password/", views.change_password_view, name="change_password"),
    path("delete_account/", views.delete_account_view, name="delete_account"),
    ## Friends Paths
    path("add_friend/", views.add_friend_view, name="add_friend"),
    path("remove_friend/<str:username>/", views.remove_friend, name="remove_friend"),
    path("accept_friend/<str:username>/", views.accept_friend, name="accept_friend"),
    path("reject_friend/<str:username>/", views.reject_friend, name="reject_friend"),
    path("friends/", views.friend_list, name="friend_list"),
]
