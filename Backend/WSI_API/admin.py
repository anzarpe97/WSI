from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class UsuarioAdmin(UserAdmin):
    # Campos que se mostrarán en el panel de administración
    list_display = ('email', 'nombre', 'apellido', 'rol', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'rol')
    search_fields = ('email', 'nombre', 'apellido', 'cedula')
    ordering = ('email',)

    # Configuración de los campos en el formulario de edición
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('nombre', 'apellido', 'tipoCedula', 'cedula', 'telefono', 'rol')}),
        ('Permisos', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'fechaRegistro')}),
    )

    # Configuración de los campos en el formulario de creación
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'nombre', 'apellido', 'tipoCedula', 'cedula', 'telefono', 'rol', 'is_staff', 'is_active'),
        }),
    )

    # Campos de solo lectura
    readonly_fields = ('fechaRegistro',)

# Registra el modelo y el administrador personalizado
admin.site.register(Usuario, UsuarioAdmin)