from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .models import DetalleMantenimiento, MotivoMantenimiento, Usuario, Vehiculo, Mantenimiento, DocumentoChofer, NotificacionUsuario, NotificacionGlobal
import re

User = get_user_model()

class CustomAuthTokenSerializer(serializers.Serializer):

    """
    Serializador personalizado para autenticación de usuarios mediante email y contraseña.

    Este serializador valida las credenciales proporcionadas por el usuario.
    - Verifica que el email exista en la base de datos.
    - Comprueba que la contraseña sea correcta.
    - Si las credenciales son válidas, añade el usuario validado al diccionario de atributos.

    Campos:
        email (EmailField): Correo electrónico del usuario.
        password (CharField): Contraseña del usuario.

    Métodos:
        validate(attrs):
            Realiza la validación de las credenciales.
            Lanza una excepción si el email no existe o la contraseña es incorrecta.

    Retorna:
        dict: Diccionario con los atributos originales más el objeto `user` validado.
    """

    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Correo electronico no encontrado")

        if not check_password(password, user.password):
            raise serializers.ValidationError("Contraseña incorrecta")

        attrs['user'] = user
        return attrs

class UsuarioSerializer(serializers.ModelSerializer):
    
    """
        Serializador para el modelo Usuario.

        Este serializador convierte instancias del modelo Usuario en representaciones JSON
        y viceversa, permitiendo la lectura y escritura de los siguientes campos:

        Campos serializados:
        - id (int): Identificador único del usuario.
            - nombre (str): Nombre del usuario.
            - apellido (str): Apellido del usuario.
            - email (str): Correo electrónico del usuario.
            - rol (str): Rol asignado al usuario (por ejemplo: administrador, cliente, etc.).

        Se basa en ModelSerializer para generar automáticamente los campos a partir del modelo. 
    """
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'email', 'rol'] 
        
class RegistroUsuarioSerializer(serializers.ModelSerializer):
    
    """
    Serializer para registrar nuevos usuarios en el sistema.

    Este serializer valida y crea una instancia del modelo Usuario.
    Incluye validaciones para asegurar que los datos ingresados sean correctos y seguros.

    Campos:
        - email (str): Correo electrónico único del usuario. Requerido.
        - nombre (str): Nombre del usuario. Requerido.
        - apellido (str): Apellido del usuario. Requerido.
        - tipoCedula (str): Tipo de cédula (V o E). Requerido.
        - cedula (str): Número de cédula único. Solo números. Requerido.
        - telefono (str): Número de teléfono de 10 dígitos. Requerido.
        - rol (str): Rol del usuario ('0': Admin, '1': Supervisor, '2': Empleado). Requerido.
        - password (str): Contraseña del usuario. Requerido. Mínimo 8 caracteres, debe incluir al menos una mayúscula, un número y un carácter especial.

    Métodos:
        - validate_<campo>: Métodos individuales para validar campos específicos.
        - validate_password: Asegura que la contraseña cumpla con los requisitos de seguridad.
        - create: Crea un nuevo usuario y encripta su contraseña.

    Errores posibles:
        - Email duplicado.
        - Cédula duplicada o no numérica.
        - Teléfono no válido.
        - Rol fuera de los valores aceptados.
        - Contraseña débil o inválida.
    """
    
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = [
            'email', 'nombre', 'apellido',
            'tipoCedula', 'cedula', 'telefono',
            'rol', 'password'
        ]

     # --- VALIDACIÓN NOMBRE --- 
        def validate_nombre(self, value):
            
            value = value.title()
            
            # --- VALIDAR SI EL NOMBRE TIENE CARACTERES ESPECIALES O NUMEROS ---
            if not re.fullmatch(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', value):
                raise serializers.ValidationError("El nombre del empleado no puede contener numeros ni caracteres especiales.")
            
            # --- VALIDAR SI EL NOMBRE TIENE MAS DE 30 CARACTERES ---
            if  len (value) > 30: 
                raise serializers.ValidationError("El nombre no puede contener mas de 30 caracteres.")
            
            return value
        
        # --- VALIDACIÓN APELLIDO --- 
        def validate_apellido (self, value):
            
            value = value.title()
            
            # --- VALIDAR SI EL APELLIDO TIENE CARACTERES ESPECIALES O NUMEROS ---
            if not re.fullmatch(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$', value):
                raise serializers.ValidationError("El nombre del empleado no puede contener numeros ni caracteres especiales.")
            
            # --- VALIDAR SI EL APELLIDO TIENE MAS DE 30 CARACTERES ---
            if  len (value) > 30: 
                raise serializers.ValidationError("El nombre no puede contener mas de 30 caracteres.")
            
            return value
        
        def validate_cedula(self, value):
            
            if not value.isdigit():
                raise serializers.ValidationError("La cédula debe contener solo números.")
            
            if value > 99999999 or value < 1000000:
                raise serializers.ValidationError("Numero de cedula no valido")

            return value          

    def validate_password(self, value):
        
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
        
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\'\\:"|<,./<>?]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial.")
        
        return value

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def validate_cedula(self, value):
        if Usuario.objects.filter(cedula=value).exists():
            raise serializers.ValidationError("Esta cédula ya está registrada.")
        if not value.isdigit():
            raise serializers.ValidationError("La cédula debe contener solo números.")
        return value

    def validate_telefono(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("El teléfono debe contener solo números.")
        if len(value) != 10:
            raise serializers.ValidationError("El teléfono debe tener 10 dígitos.")
        return value

    def validate_rol(self, value):
        if value not in ['0', '1', '2']:
            raise serializers.ValidationError("Rol inválido. Use 0, 1 o 2.")
        return value

    def validate_tipoCedula(self, value):
        if value not in ['V', 'E']:
            raise serializers.ValidationError("Tipo de cédula inválido. Use 'V' o 'E'.")
        return value

    def validate(self, data):
        # Puedes agregar validaciones cruzadas aquí si lo deseas
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user  

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = [
            'id_vehiculo', 'placa', 'marca', 'modelo', 'anio', 'color', 
            'tipologia', 'motor', 'capacidad_carga', 'tipo_combustible', 
            'capacidad_combustible', 'kilometraje', 'costo', 'estado', 
            'fecha_creado', 'borrado', 'motivo_borrado' # Removed fecha_actualizado
        ]
        read_only_fields = ['id_vehiculo', 'fecha_creado'] # Removed fecha_actualizado

    def validate_placa(self, value):
        if not value:
            raise serializers.ValidationError("La placa es requerida.")
        if len(value) > 20:
            raise serializers.ValidationError("La placa no puede tener más de 20 caracteres.")
        return value.upper()

    def validate_kilometraje(self, value):
        if value < 0:
            raise serializers.ValidationError("El kilometraje debe ser un número positivo.")
        return value

    def validate_anio(self, value):
        from datetime import datetime
        current_year = datetime.now().year
        if value < 1950 or value > current_year:
            raise serializers.ValidationError(f"El año debe estar entre 1950 y {current_year}.")
        return value

    def validate_capacidad_carga(self, value):
        if value < 0:
            raise serializers.ValidationError("La capacidad de carga debe ser positiva.")
        return value

    def validate_capacidad_combustible(self, value):
        if value < 0:
            raise serializers.ValidationError("La capacidad de combustible debe ser positiva.")
        return value

    def validate_costo(self, value):
        if value < 0:
            raise serializers.ValidationError("El costo debe ser positivo.")
        return value

    def validate(self, attrs):
        # Puedes agregar validaciones cruzadas aquí si lo necesitas
        return attrs
        
class VehiculoPlacaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = ['id_vehiculo', 'placa']
        
class MecanicoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Usuario
        
        fields = ['id', 'nombre', 'apellido']
        
class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'cedula', 'telefono', 'email', 'rol']

class PlacaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = ['id_vehiculo', 'placa', 'modelo', 'marca']

class MantenimientoSerializer(serializers.ModelSerializer):
    motivo = serializers.CharField(source='id_motivo.motivo', read_only=True)
    placa = serializers.CharField(source='id_vehiculo.placa', read_only=True)

    class Meta:
        model = Mantenimiento
        fields = ['id_mantenimiento', 'motivo', 'placa', 'estado', 'fecha_programada']

class VehiculoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = ['placa', 'marca', 'modelo', 'anio']

class DocumentoChoferSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoChofer
        fields = '__all__'
        
class NotificacionGlobalSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificacionGlobal
        fields = ['id_notificacion', 'titulo', 'mensaje', 'tipo', 'fecha_creacion']

class NotificacionUsuarioSerializer(serializers.ModelSerializer):
    notificacion = NotificacionGlobalSerializer(read_only=True)

    class Meta:
        model = NotificacionUsuario
        fields = ['id', 'notificacion', 'leida', 'fecha_leida']
        
class MotivoMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivoMantenimiento
        fields = ['id_motivo', 'motivo']
        
class DetalleSuministroSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleMantenimiento
        fields = ['motivo', 'cantidad', 'precio_und', 'total']      
        
class DetalleMantenimientoSerializer(serializers.ModelSerializer):
    vehiculo = VehiculoSimpleSerializer(source='id_vehiculo', read_only=True)
    motivo = serializers.CharField(source='id_motivo.motivo', read_only=True)
    mecanico = MecanicoSerializer(source='id_mecanico', read_only=True)
    suministros = DetalleSuministroSerializer(source='detallemantenimiento_set', many=True, read_only=True)

    class Meta:
        model = Mantenimiento
        fields = [
            'id_mantenimiento',
            'vehiculo',
            'motivo',
            'mecanico',
            'estado',
            'fecha_programada',
            'fecha_finalizado',
            'tipo_mantenimiento',
            'observaciones',
            'suministros'
        ]

















