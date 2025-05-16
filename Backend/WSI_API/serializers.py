# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .models import Usuario
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
        
class RegistroUsuarioSerializer (serializers.ModelSerializer):
    
    class Meta:
        
        model = Usuario
        field = ['password', 'nombre', 'apellido', 'tipoCedula', 'cedula', 'telefono', 'rol']
    
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
        
        def validate_telefono(self, value):
            
            if len(value) < 10 or len(value) > 15:
                raise serializers.ValidationError("El teléfono debe tener entre 10 y 15 dígitos.")
            
            return value  
            
            
        