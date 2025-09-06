from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from WSI_API.views import restablecer_contraseña, solicitar_restaurar_contraseña, ReporteFallaListAPIView, CrearReporteFallaAPIView, ReporteFallaDetailAPIView, DocumentoChoferDetailAPIView,VehiculosMasMantenimientosAPIView, finalizar_mantenimiento, DocumentoVehiculoCreateAPIView, DocumentoVehiculoListAPIView, DocumentoVehiculoDetailAPIView, UsuarioDetailAPIView, MantenimientoDetailAPIView, MotivoMantenimientoListCreateAPIView, MarcarTodasNotificacionesLeidasView, DocumentosChoferListAPIView, MarcarNotificacionLeidaView, NotificacionesUsuarioView, BuscarChoferPorCedulaAPIView, DocumentoChoferCreateAPIView, VehiculoUpdateView, MantenimientoListAPIView, CrearMantenimientoAPIView,  BuscarVehiculoPorPlacaAPIView, UsuarioListAPIView, VehiculoMecanicoComboAPIView, VehiculoDetailView, VehiculoListView,VehiculoCreateView, CustomLoginView, VerifyTokenView, registrar_usuario, get_csrf_token,RegistroUsuarioAPIView, UsuarioDeleteAPIView
    

urlpatterns = [
    path('api/documentos-vehiculos/<int:id_documento_vehiculo>/', DocumentoVehiculoDetailAPIView.as_view(), name='documento-vehiculo-detalle'),
    path('admin/', admin.site.urls),
    path('api/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('api/registrar-usuario/', registrar_usuario, name='registrar_usuario'),
    path('api/registro/', RegistroUsuarioAPIView.as_view(), name='registro_usuario'),
    path('api/csrf/', get_csrf_token, name='get_csrf_token'),
    path('api/vehiculos/registrar/', VehiculoCreateView.as_view(), name='registrar-vehiculo'),
    path('api/vehiculos/', VehiculoListView.as_view(), name='listar-vehiculos'),
    path('api/vehiculos/<int:id_vehiculo>/', VehiculoUpdateView.as_view(), name='vehiculo-detail-update'), # Changed name for clarity, this handles GET, PUT, PATCH
    path('api/vehiculos/buscar/', BuscarVehiculoPorPlacaAPIView.as_view(), name='buscar-vehiculo-por-placa'),
    path('api/usuarios/<int:id>/', UsuarioDeleteAPIView.as_view(), name='usuario-delete'),
    path('api/usuarios/', UsuarioListAPIView.as_view(), name='usuarios-list'),
    path('api/mantenimientos/', MantenimientoListAPIView.as_view(), name='listar-mantenimientos'),
    path('api/detalle-mantenimiento/<int:pk>/', MantenimientoDetailAPIView.as_view(), name='mantenimiento-detail'),
    path('api/documentos-chofer/<int:id_documento_chofer>/', DocumentoChoferDetailAPIView.as_view(), name='documento-chofer-detalle'),
    path('api/mantenimientos/crear/', CrearMantenimientoAPIView.as_view(), name='crear-mantenimiento'),
    path('api/documentos-choferes/', DocumentoChoferCreateAPIView.as_view(), name='documentos-choferes-create'),
    path('api/vehiculos/registrar/', VehiculoCreateView.as_view(), name='registrar-vehiculo'),
    path('api/documentos-choferes-verificar/', DocumentosChoferListAPIView.as_view(), name='documentos-choferes-list'),
    path('api/choferes/', BuscarChoferPorCedulaAPIView.as_view(), name='buscar-chofer-por-cedula'),
    path('api/documentos-choferes-verificar/', DocumentosChoferListAPIView.as_view(), name='documentos-choferes-list'),
    path('api/motivos/', MotivoMantenimientoListCreateAPIView.as_view(), name='motivo-mantenimiento-list'),
    path('api/detalle-usuarios/<int:id>/', UsuarioDetailAPIView.as_view(), name='usuario-detail'),
    path('api/documentos-vehiculos/', DocumentoVehiculoListAPIView.as_view(), name='documentos-vehiculos-list'),  # GET
    path('api/documentos-vehiculos/crear/', DocumentoVehiculoCreateAPIView.as_view(), name='documentos-vehiculos-create'),  # POST  
    path('api/mantenimientos/<int:id>/finalizar/', finalizar_mantenimiento, name='finalizar_mantenimiento'),
    # NOTIFICACIONES
    path('api/notificaciones/', NotificacionesUsuarioView.as_view(), name='notificaciones-usuario'),
    path('api/notificaciones/<int:pk>/marcar-leida/', MarcarNotificacionLeidaView.as_view(), name='marcar-notificacion-leida'),
    path('api/notificaciones/marcar-todas-leidas/', MarcarTodasNotificacionesLeidasView.as_view(), name='marcar-todas-notificaciones-leidas'),
    path('api/reportes-fallas/crear/', CrearReporteFallaAPIView.as_view(), name='crear-reporte-falla'),
    #ESTADISTICAS
    path('api/vehiculos-mas-mantenimientos/', VehiculosMasMantenimientosAPIView.as_view(), name='vehiculos-mas-mantenimientos'),
    path('api/reportes-fallas/', ReporteFallaListAPIView.as_view(), name='listar-reportes-fallas'),
    path('api/reportes-fallas/<int:pk>/', ReporteFallaDetailAPIView.as_view(), name='detalle-reporte-falla'),
    path('api/solicitar-restablecimiento/', solicitar_restaurar_contraseña, name='solicitar-restablecimiento'),
    path('api/reset-password/', restablecer_contraseña, name='restablecer-contraseña'),
    path('api/usuarios/<int:id>/', UsuarioDeleteAPIView.as_view(), name='usuario-delete'),

]   

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)