from django.db import models
from datetime import datetime
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, apellido, tipoCedula, cedula, telefono, rol, password=None):
        if not email:
            raise ValueError("Debe ingresar un correo electrónico")
        usuario = self.model(
            email=self.normalize_email(email),
            nombre=nombre,
            apellido=apellido,
            tipoCedula=tipoCedula,
            cedula=cedula,
            telefono=telefono,
            rol=rol,
        )
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, nombre, apellido, tipoCedula, cedula, telefono, rol, password=None):
        usuario = self.create_user(
            email=email,
            nombre=nombre,
            apellido=apellido,
            tipoCedula=tipoCedula,
            cedula=cedula,
            telefono=telefono,
            rol=rol,
            password=password,
        )
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.save(using=self._db)
        return usuario

class Usuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField('correo electrónico', unique=True, max_length=150, null=False)
    nombre = models.CharField('nombre', max_length=30, null=False)
    apellido = models.CharField('apellido', max_length=30, null=False)
    tipoCedula = models.CharField('tipo de cédula', max_length=1, null=False)
    cedula = models.CharField('cédula', max_length=8, unique=True, null=False)
    telefono = models.CharField('teléfono', max_length=10, null=False)
    fechaRegistro = models.DateTimeField('fecha de registro', auto_now_add=True)
    rol = models.CharField('rol', max_length=1, null=False)

    # Django Admin
    is_active = models.BooleanField('activo', default=True)
    is_staff = models.BooleanField('es personal', default=False)
    is_superuser = models.BooleanField('es superusuario', default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'tipoCedula', 'cedula', 'telefono', 'rol']

    def __str__(self):
        roles = {
            '0': 'Administrador',
            '1': 'Supervisor',
            '2': 'Empleado',
        }
        return f'{self.nombre} {self.apellido} - {roles.get(self.rol, "Rol no definido")}'

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True