from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import Vehiculo, NotificacionGlobal, NotificacionUsuario, Usuario


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

@receiver(post_save, sender=Vehiculo)
def crear_notificacion_vehiculo(sender, instance, created, **kwargs):
    if created:
        # Crear la notificación global
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