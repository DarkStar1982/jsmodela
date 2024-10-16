from django.urls import path
from pages import views
from django.urls import path, re_path


urlpatterns = [
    re_path(r'^models/(?P<model_id>[a-f0-9]+)$', views.home, name='home'),
]
