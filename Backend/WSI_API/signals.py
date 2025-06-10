from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import (
    Mantenimiento, Vehiculo, NotificacionGlobal, NotificacionUsuario, Usuario,
    DocumentoChofer, DocumentoVehiculo
)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
        # Notificación por nuevo usuario
        notificacion = NotificacionGlobal.objects.create(
            titulo="Nuevo Usuario Registrado",
            mensaje=f"Se ha registrado el usuario {instance.nombre} ({getattr(instance, 'nombre', '')} {getattr(instance, 'apellido', '')})",
            tipo="USUARIO",
            rol_destino='0,1,2'
        )
        usuarios = Usuario.objects.filter(rol__in=['0','1','2'])
        for usuario in usuarios:
            NotificacionUsuario.objects.create(
                notificacion=notificacion,
                usuario=usuario
            )

@receiver(post_save, sender=Vehiculo)
def crear_notificacion_vehiculo(sender, instance, created, **kwargs):
    if created:
        notificacion = NotificacionGlobal.objects.create(
            titulo="Nuevo Vehículo Registrado",
            mensaje=f"Se ha registrado el vehículo {instance.placa} ({instance.marca} {instance.modelo})",
            tipo="VEHICULO",
            rol_destino='0,1,2'
        )
        usuarios = Usuario.objects.filter(rol__in=['0','1','2'])
        for usuario in usuarios:
            NotificacionUsuario.objects.create(
                notificacion=notificacion,
                usuario=usuario
            )

@receiver(post_save, sender=Mantenimiento)
def crear_notificacion_mantenimiento(sender, instance, created, **kwargs):
    if created:
        notificacion = NotificacionGlobal.objects.create(
            titulo="Nuevo Mantenimiento Registrado",
            mensaje=f"Se ha registrado un mantenimiento para el vehículo {instance.id_vehiculo.placa} ({instance.id_vehiculo.marca} {instance.id_vehiculo.modelo})",
            tipo="MANTENIMIENTO",
            rol_destino='0,1,2'
        )
        usuarios = Usuario.objects.filter(rol__in=['0','1','2'])
        for usuario in usuarios:
            NotificacionUsuario.objects.create(
                notificacion=notificacion,
                usuario=usuario
            )

@receiver(post_save, sender=DocumentoChofer)
def crear_notificacion_documento_chofer(sender, instance, created, **kwargs):
    if created:
        notificacion = NotificacionGlobal.objects.create(
            titulo="Nuevo Documento de Chofer Registrado",
            mensaje=f"Se ha registrado un documento para el chofer {instance.chofer.nombre} {instance.chofer.apellido}",
            tipo="DOCUMENTO_CHOFER",
            rol_destino='0,1,2'
        )
        usuarios = Usuario.objects.filter(rol__in=['0','1','2'])
        for usuario in usuarios:
            NotificacionUsuario.objects.create(
                notificacion=notificacion,
                usuario=usuario
            )

@receiver(post_save, sender=DocumentoVehiculo)
def crear_notificacion_documento_vehiculo(sender, instance, created, **kwargs):
    if created:
        notificacion = NotificacionGlobal.objects.create(
            titulo="Nuevo Documento de Vehículo Registrado",
            mensaje=f"Se ha registrado un documento para el vehículo {instance.vehiculo.placa} ({instance.vehiculo.marca} {instance.vehiculo.modelo})",
            tipo="DOCUMENTO_VEHICULO",
            rol_destino='0,1,2'
        )
        usuarios = Usuario.objects.filter(rol__in=['0','1','2'])
        for usuario in usuarios:
            NotificacionUsuario.objects.create(
                notificacion=notificacion,
                usuario=usuario
            )