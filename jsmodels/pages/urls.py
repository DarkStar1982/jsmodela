from django.urls import path
from pages import views
from django.urls import path, re_path


urlpatterns = [
    path("model",views.home, name='home'),
    path("model/get_data", views.api, name='api'),
    re_path(r'^model/(?P<model_id>[a-f0-9]+)$', views.home, name='home'),

]
