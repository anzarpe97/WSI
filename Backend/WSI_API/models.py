from django.db import models
from datetime import datetime
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# USUARIO PERSONALIZADO DJANGO
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

# MODELO DE USUARIO
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
 
# MODELO DE VEHICULO
class Vehiculo(models.Model):
    
    ESTADOS_VEHICULO = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
        ('EN_MANTENIMIENTO', 'En Mantenimiento'),
    ]
    
    TIPOS_COMBUSTIBLE = [
        ('GASOLINA', 'Gasolina'),
        ('DIESEL', 'Diésel'),
    ]
    
    id_vehiculo = models.AutoField(primary_key=True, verbose_name='ID Vehiculo' )
    placa = models.CharField(unique=True, max_length=20, verbose_name='Placa Vehiculo')
    kilometraje = models.IntegerField(null = False, verbose_name='Kilometraje Vehiculo')
    estado = models.CharField(max_length=16, choices=ESTADOS_VEHICULO, default='ACTIVO', verbose_name='Estado del vehículo')
    marca = models.CharField(max_length=50, null=False, verbose_name='Marca vehículo')
    modelo = models.CharField(max_length=50, null=False, verbose_name='Modelo vehículo')
    motor = models.CharField( max_length=50, blank=True, null=False, verbose_name="Número/Código del motor")
    anio = models.IntegerField( blank=True, null=False, verbose_name="Año de fabricación")
    color = models.CharField( max_length=30, blank=True, null=False, verbose_name="Color del vehículo")
    tipologia = models.CharField( max_length=50, blank=True, null=False, verbose_name="Tipología del vehículo")
    capacidad_carga = models.DecimalField( max_digits=10, decimal_places=2, blank=True, null=False, verbose_name="Capacidad máxima de carga (kg)")
    capacidad_combustible = models.DecimalField( max_digits=10, decimal_places=2, blank=True, null=False, verbose_name="Capacidad del tanque (litros") 
    costo = models.DecimalField( max_digits=10, decimal_places=2, null=False, verbose_name="Costo del vehículo")
    tipo_combustible = models.CharField(max_length=10, choices = TIPOS_COMBUSTIBLE, default='GASOLINA', null=False, blank=False, verbose_name='Tipo de Combustible')
    fecha_creado = models.DateTimeField(auto_now_add=True,verbose_name='Fecha de creación')

    def __str__(self):
        
        return f"{self.placa} - ({self.marca} {self.modelo})"

    class Meta:
        verbose_name = 'Vehiculo'
        verbose_name_plural = 'Vehiculos'
        db_table = 'vehiculo'
        
# MODELO DE MANTENIMIENTO
class Mantenimiento(models.Model):
    
    TIPO_MANTENIMIENTO_CHOICES = [
        ('PREVENTIVO', 'PREVENTIVO'),
        ('CORRECTIVO', 'CORRECTIVO'),
        ('PREDICTIVO', 'PREDICTIVO'),
    ]

    ESTADO_CHOICES = [
        ('ACTIVO', 'ACTIVO'),
        ('FINALIZADO', 'FINALIZADO'),
        ('PENDIENTE', 'PENDIENTE'),
        ('CANCELADO', 'CANCELADO'),
    ]

    # ATRIBUTOS MODELO MANTENIMIENTO
    id_mantenimiento = models.AutoField(primary_key=True)
    id_vehiculo = models.ForeignKey('Vehiculo', models.RESTRICT, db_column='id_vehiculo', null=False)
    id_mecanico = models.ForeignKey('Usuario', models.RESTRICT, db_column='id_usuario', blank=True, null=False)
    id_motivo = models.ForeignKey('MotivoMantenimiento', models.RESTRICT, db_column='id_motivo', blank=True, null=False)
    fecha_programada = models.DateField(null=False)
    fecha_finalizado = models.DateField(blank=True, null=True)
    tipo_mantenimiento = models.CharField(max_length=10, choices=TIPO_MANTENIMIENTO_CHOICES)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='ACTIVO')
    observaciones = models.TextField(blank=True, null=True)

    
    # MOSTRAR EL NOMBRE DEL VEHICULO Y EL TIPO DE MANTENIMIENTO EN EL ADMINISTRADOR DJANGO
    def __str__(self):
        return f"Mantenimiento {self.id_mantenimiento} - Vehículo {self.id_vehiculo.placa}"
    
    class Meta:
        verbose_name = 'Mantenimiento'
        verbose_name_plural = 'Mantenimientos'
        db_table = 'mantenimiento'   
        
# MODELO DE MOTIVO DE MANTENIMIENTO
class MotivoMantenimiento(models.Model):
    
    # ATRIBUTOS MODELO MOTIVO MANTENIMIENTO
    id_motivo = models.AutoField(primary_key=True)
    motivo = models.CharField(max_length=60)
    
    # MOSTRAR EL MOTIVO EN EL ADMINISTRADOR DJANGO
    def __str__(self):
        return self.motivo 
    
    class Meta:
        verbose_name = 'Motivo Mantenimiento'
        verbose_name_plural = 'Motivos Mantenimiento'
        db_table = 'motivo_mantenimiento'
              
# MODELO DE DETALLE DE MANTENIMIENTO        
class DetalleMantenimiento(models.Model):
    
    # ATRIBUTOS MODELO DETALLE MANTENIMIENTO
    id_detalle = models.AutoField(primary_key=True)
    id_mantenimiento = models.ForeignKey('Mantenimiento', models.RESTRICT, db_column='id_mantenimiento', null= False)
    motivo = models.CharField(max_length=60, null= False)
    cantidad = models.IntegerField(null= False)
    precio_und = models.DecimalField(max_digits=10, decimal_places=2, null= False)
    total = models.DecimalField(max_digits=10, decimal_places=2, null= False)

    # MOSTRAR EL ID DEL DETALLE Y EL ID DEL MANTENIMIENTO EN EL ADMINISTRADOR DJANGO
    def __str__(self):
        return f"Detalle {self.id_detalle} - Mantenimiento {self.id_mantenimiento.id_mantenimiento}"
    
    class Meta: 
        verbose_name = 'Detalle Mantenimiento'
        verbose_name_plural = 'Detalles Mantenimiento'
        db_table = 'detalle_mantenimiento'