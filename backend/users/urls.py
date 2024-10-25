from django.urls import path
from .views import views
from .views import api_42
from .views import friends
from .views import match

urlpatterns = [
    ## Authorization Paths
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register_view, name="register"),
    ## 42API Paths
    path("login_42/", api_42.login_42, name="login_42"),
    ## Profile Paths
    path("profile/", views.profile_view, name="profile"),
    path("profile/edit/", views.edit_profile_view, name="edit_profile"),
    ## 2FA Paths
    path("2fa/verify", views.verify_otp_view, name="verify_otp"),
    path("2fa/enable", views.enable_2fa, name="enable_2fa"),
    path("2fa/disable", views.disable_2fa, name="disable_2fa"),
    path("2fa/reset", views.reset_2fa_view, name="reset_2fa"),
    ## Account Settings Paths
    path("change_password/", views.change_password_view, name="change_password"),
    path("delete_account/", views.delete_account_view, name="delete_account"),
    ## Friends Paths
    path("add_friend/<str:username>/", friends.add_friend, name="add_friend"),
    path("remove_friend/<str:username>/", friends.remove_friend, name="remove_friend"),
    path("accept_friend/<str:username>/", friends.accept_friend, name="accept_friend"),
    path("reject_friend/<str:username>/", friends.reject_friend, name="reject_friend"),
    path("friends/", friends.friends_list, name="friends"),
    ## Match History Paths
    path("save_match_results/", match.save_match_result, name="match_result"),
]
