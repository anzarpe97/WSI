from django.contrib import admin
from django.urls import path
from WSI_API.views import CrearMantenimientoAPIView,  BuscarVehiculoPorPlacaAPIView, UsuarioListAPIView, VehiculoMecanicoComboAPIView, VehiculoDetailView, VehiculoListView,VehiculoCreateView, CustomLoginView, VerifyTokenView, registrar_usuario, get_csrf_token,RegistroUsuarioAPIView

urlpatterns = [
    path('admin/', admin.site.urls),  # Mejor dejar admin en /admin/ para no confundir
    path('api/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('api/registrar-usuario/', registrar_usuario, name='registrar_usuario'),
    path('api/registro/', RegistroUsuarioAPIView.as_view(), name='registro_usuario'),
    path('api/csrf/', get_csrf_token, name='get_csrf_token'),
    path('api/vehiculos/registrar/', VehiculoCreateView.as_view(), name='registrar-vehiculo'),
    path('api/vehiculos/', VehiculoListView.as_view(), name='listar-vehiculos'),
    path('api/vehiculos-usuarios/', VehiculoMecanicoComboAPIView.as_view(), name='vehiculo-usuario-combo'),
    path('api/vehiculos/<int:id_vehiculo>/', VehiculoDetailView.as_view(), name='detalle-vehiculo'),
    path('api/vehiculos/buscar/', BuscarVehiculoPorPlacaAPIView.as_view(), name='buscar-vehiculo-por-placa'),
    path('api/usuarios/', UsuarioListAPIView.as_view(), name='usuarios-list'),
    path('api/mantenimientos/crear/', CrearMantenimientoAPIView.as_view(), name='crear-mantenimiento'),


]