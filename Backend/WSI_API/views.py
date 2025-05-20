from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.authtoken.models import Token
from .models import Usuario, Vehiculo
from .serializers import EmpleadoSerializer, MecanicoSerializer, VehiculoPlacaSerializer, VehiculoSerializer, RegistroUsuarioSerializer, CustomAuthTokenSerializer, UsuarioSerializer, RegistroUsuarioSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

@csrf_exempt
@api_view(['POST'])
def registrar_usuario(request):
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Empleado registrado exitosamente"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomAuthTokenSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'nombre': user.nombre,
                    'apellido': user.apellido,
                    'cedula': user.cedula,
                    'rol': user.rol,
                }
            })

        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"detail": "El correo y la contraseña son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Usuario.objects.get(email=email)
            if not user.check_password(password):
                return Response(
                    {"detail": "Contraseña incorrecta."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Correo no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {"detail": "Error al iniciar sesión."},
            status=status.HTTP_400_BAD_REQUEST
        )

class VerifyTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = UsuarioSerializer(request.user).data
        return Response({
            "isValid": True,
            "user": user_data
        })

    def post(self, request):
        user_data = UsuarioSerializer(request.user).data
        return Response({
            "message": "Token válido (POST)",
            "user": user_data
        })

class RegistroUsuarioAPIView(APIView):
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"mensaje": "Usuario registrado correctamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VehiculoCreateView(generics.CreateAPIView):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class VehiculoListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        vehiculos = Vehiculo.objects.all()
        serializer = VehiculoSerializer(vehiculos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class VehiculoDetailView(generics.RetrieveAPIView):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id_vehiculo'
    
class VehiculoMecanicoComboAPIView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]  # O AllowAny si no requieres autenticación

    def get(self, request):
        # Vehículos: id_vehicul y placa
        vehiculos = Vehiculo.objects.all()
        vehiculos_data = VehiculoPlacaSerializer(vehiculos, many=True).data

        # Usuarios con rol = 2 (Empleado)
        usuarios = Usuario.objects.filter(rol='2')
        usuarios_data = MecanicoSerializer(usuarios, many=True).data

        return Response({
            "vehiculos": vehiculos_data,
            "usuarios": usuarios_data
        })
        
class UsuarioListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuarios = Usuario.objects.filter(rol__in=['1', '2'])
        serializer = EmpleadoSerializer(usuarios, many=True)
        return Response(serializer.data)