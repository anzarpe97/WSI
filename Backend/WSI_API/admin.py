from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Vehiculo, Mantenimiento

class UsuarioAdmin(UserAdmin):
       
    list_display = ('email', 'nombre', 'apellido', 'rol', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'rol')
    search_fields = ('email', 'nombre', 'apellido', 'cedula')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('nombre', 'apellido', 'tipoCedula', 'cedula', 'telefono', 'rol')}),
        ('Permisos', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'fechaRegistro')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'nombre', 'apellido', 'tipoCedula', 'cedula', 'telefono', 'rol', 'is_staff', 'is_active'),
        }),
    )


    readonly_fields = ('fechaRegistro',)
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Vehiculo)
admin.site.register(Mantenimiento)