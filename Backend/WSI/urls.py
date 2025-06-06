from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from WSI_API.views import MarcarTodasNotificacionesLeidasView, DocumentosChoferListAPIView, MarcarNotificacionLeidaView, NotificacionesUsuarioView, BuscarChoferPorCedulaAPIView, DocumentoChoferCreateAPIView, VehiculoUpdateView, MantenimientoListAPIView, CrearMantenimientoAPIView,  BuscarVehiculoPorPlacaAPIView, UsuarioListAPIView, VehiculoMecanicoComboAPIView, VehiculoDetailView, VehiculoListView,VehiculoCreateView, CustomLoginView, VerifyTokenView, registrar_usuario, get_csrf_token,RegistroUsuarioAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('api/registrar-usuario/', registrar_usuario, name='registrar_usuario'),
    path('api/registro/', RegistroUsuarioAPIView.as_view(), name='registro_usuario'),
    path('api/csrf/', get_csrf_token, name='get_csrf_token'),
    path('api/vehiculos/registrar/', VehiculoCreateView.as_view(), name='registrar-vehiculo'),
    path('api/vehiculos/', VehiculoListView.as_view(), name='listar-vehiculos'),
    path('api/vehiculos/<int:id_vehiculo>/', VehiculoUpdateView.as_view(), name='actualizar-vehiculo'),
    path('api/vehiculos/<int:id_vehiculo>/', VehiculoDetailView.as_view(), name='detalle-vehiculo'),
    path('api/vehiculos/buscar/', BuscarVehiculoPorPlacaAPIView.as_view(), name='buscar-vehiculo-por-placa'),
    path('api/usuarios/', UsuarioListAPIView.as_view(), name='usuarios-list'),
    path('api/mantenimientos/', MantenimientoListAPIView.as_view(), name='listar-mantenimientos'),
    path('api/mantenimientos/crear/', CrearMantenimientoAPIView.as_view(), name='crear-mantenimiento'),
    path('api/documentos-choferes/', DocumentoChoferCreateAPIView.as_view(), name='documentos-choferes-create'),
    path('api/choferes/', BuscarChoferPorCedulaAPIView.as_view(), name='buscar-chofer-por-cedula'),
    path('api/documentos-choferes-verificar/', DocumentosChoferListAPIView.as_view(), name='documentos-choferes-list'),

    
    # NOTIFICACIONES
    path('api/notificaciones/', NotificacionesUsuarioView.as_view(), name='notificaciones-usuario'),
    path('api/notificaciones/<int:pk>/marcar-leida/', MarcarNotificacionLeidaView.as_view(), name='marcar-notificacion-leida'),
    path('api/notificaciones/marcar-todas-leidas/', MarcarTodasNotificacionesLeidasView.as_view(), name='marcar-todas-notificaciones-leidas'),

]   

# Agrega esto al final del archivo para servir archivos media en desarrollo
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)