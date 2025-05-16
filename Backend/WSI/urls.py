from django.contrib import admin
from django.urls import path
from WSI_API.views import CustomLoginView, VerifyTokenView, registrar_usuario, get_csrf_token

urlpatterns = [
    path('admin/', admin.site.urls),  # Mejor dejar admin en /admin/ para no confundir
    path('api/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('api/registrar-usuario/', registrar_usuario, name='registrar_usuario'),
    path('api/csrf/', get_csrf_token, name='get_csrf_token'),
]