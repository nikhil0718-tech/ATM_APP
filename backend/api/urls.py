from django.urls import path
from . import views
from .views import test_api
urlpatterns = [
    path('test/', views.test_api),

    path('register/', views.register),
    path('login/', views.login),

    path('deposit/', views.deposit),
    path('withdraw/', views.withdraw),

    path('balance/<int:id>/', views.balance),
    path('change-pin/', views.change_pin),

    path('transactions/<int:id>/', views.get_transactions),
    path('account/<int:id>/', views.account_details),
]