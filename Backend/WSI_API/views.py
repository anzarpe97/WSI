from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.core.mail import EmailMultiAlternatives
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.authtoken.models import Token
from .models import Usuario, Vehiculo, Mantenimiento, DetalleMantenimiento
from .serializers import ( DocumentoChoferSerializer, MantenimientoSerializer, PlacaSerializer, EmpleadoSerializer, MecanicoSerializer, VehiculoPlacaSerializer, VehiculoSerializer, RegistroUsuarioSerializer, CustomAuthTokenSerializer, UsuarioSerializer)
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_usuario(request):
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        usuario = serializer.save()
        # Enviar correo de notificación al usuario registrado
        try:
            print("Intentando enviar correo a:", usuario.email)
            send_mail(
                subject='Registro exitoso en WSI',
                message=f'Hola {usuario.nombre}, tu registro en WSI fue exitoso. ¡Bienvenido!',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[usuario.email],
                fail_silently=False,
            )
            print("Correo enviado correctamente.")
        except Exception as e:
            print(f"Error enviando correo: {e}")
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
            usuario = serializer.save()
            print("USUARIO CREADO")
            # Enviar correo de notificación al usuario registrado
            try:
                print("Intentando enviar correo a:", usuario.email)
                subject = 'WSI - Registro Exitoso'
                from_email = settings.DEFAULT_FROM_EMAIL
                to_email = [usuario.email]
                text_content = (
                    f'Hola {usuario.nombre}, tu registro en WSI fue exitoso.\n'
                    f'Correo: {usuario.email}\n'
                    f'Contraseña: {request.data.get("password")}\n'
                    '¡Bienvenido!'
                )
                html_content = f"""
                                    <html>
                                    <body style="margin:0;padding:0;background:#f5f5f5;">
                                        <table width="100%" bgcolor="#f5f5f5" cellpadding="0" cellspacing="0" style="padding:0;margin:0;">
                                        <tr>
                                            <td align="center">
                                            <table width="100%" style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.10);overflow:hidden;">
                                                <tr>
                                                <td style="background:#ff6a00;padding:32px 0;text-align:center;">
                                                    <h1 style="color:#fff;margin:0;font-size:2.2rem;letter-spacing:2px;">WSI</h1>
                                                </td>
                                                </tr>
                                                <tr>
                                                <td style="padding:36px 32px 24px 32px;">
                                                    <h2 style="color:#222;margin-top:0;font-size:1.5rem;">¡Registro exitoso!</h2>
                                                    <p style="color:#222;font-size:1.12rem;margin-bottom:24px;">
                                                    Hola <b>{usuario.nombre}</b>,<br>
                                                    Tu registro en <b>WSI</b> fue exitoso.<br>
                                                    Aquí tienes tus datos de acceso:
                                                    </p>
                                                    <div style="margin: 0 0 28px 0; padding: 20px; background: #fff8f2; border-radius: 12px; border: 2px solid #ff6a00;">
                                                    <p style="margin:0;color:#222;font-size:1.08rem;">
                                                        <b style="color:#ff6a00;">Correo:</b> {usuario.email}<br>
                                                        <b style="color:#ff6a00;">Contraseña:</b> {request.data.get("password")}
                                                    </p>
                                                    </div>
                                                    <p style="color:#222;font-size:1rem;margin-bottom:0;">
                                                    Te recomendamos cambiar tu contraseña después de iniciar sesión.<br>
                                                    ¡Bienvenido a <span style="color:#ff6a00;font-weight:bold;">World Service International</span>!
                                                    </p>
                                                </td>
                                                </tr>
                                                <tr>
                                                <td style="background:#222;color:#fff;text-align:center;padding:14px 0;font-size:1rem;border-radius:0 0 16px 16px;">
                                                    © WSI {2025}
                                                </td>
                                                </tr>
                                            </table>
                                            </td>
                                        </tr>
                                        </table>
                                    </body>
                                    </html>
"""
                msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                print("Correo enviado correctamente.")
            except Exception as e:
                print(f"Error enviando correo: {e}")
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
        vehiculos = Vehiculo.objects.all()
        vehiculos_data = VehiculoPlacaSerializer(vehiculos, many=True).data

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
    
class BuscarVehiculoPorPlacaAPIView(APIView):
    def get(self, request):
        placa = request.GET.get('placa', '').upper()
        try:
            vehiculo = Vehiculo.objects.get(placa=placa)
            serializer = PlacaSerializer(vehiculo)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Vehiculo.DoesNotExist:
            return Response({"detail": "Placa no registrada"}, status=status.HTTP_404_NOT_FOUND)
    
class CrearMantenimientoAPIView(APIView):
    def post(self, request):
        data = request.data
        try:
            mantenimiento = Mantenimiento.objects.create(
                id_vehiculo_id=data['id_vehiculo'],
                id_mecanico_id=data['id_mecanico'],
                id_motivo_id=data['id_motivo'],
                fecha_programada=data['fecha_programada'],
                fecha_finalizado=data.get('fecha_finalizado'),
                tipo_mantenimiento=data['tipo_mantenimiento'],
                estado=data.get('estado', 'ACTIVO'),
                observaciones=data.get('observaciones', '')
            )
            for suministro in data.get('suministros', []):
                DetalleMantenimiento.objects.create(
                    id_mantenimiento=mantenimiento,
                    motivo=suministro['motivo'],
                    cantidad=suministro['cantidad'],
                    precio_und=suministro['precio_und'],
                    total=suministro['total']
                )
            vehiculo = Vehiculo.objects.get(pk=data['id_vehiculo'])
            vehiculo.estado = 'EN_MANTENIMIENTO'
            vehiculo.save()

            return Response({"message": "Mantenimiento y suministros registrados correctamente"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST) 
    
class MantenimientoListAPIView(ListAPIView):
    queryset = Mantenimiento.objects.all().select_related('id_motivo', 'id_vehiculo')
    serializer_class = MantenimientoSerializer   
    
class VehiculoUpdateView(RetrieveUpdateAPIView):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    lookup_field = 'id_vehiculo'
    
class DocumentoChoferCreateAPIView(APIView):
    def post(self, request, format=None):
        serializer = DocumentoChoferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BuscarChoferPorCedulaAPIView(APIView):
    def get(self, request):
        cedula = request.GET.get('cedula')
        if not cedula:
            return Response({'error': 'Debe proporcionar una cédula'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            chofer = Usuario.objects.get(cedula=cedula, rol='2')
            return Response({
                'id': chofer.id,
                'nombre': chofer.nombre,
                'apellido': chofer.apellido
            }, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'error': 'Chofer no encontrado'}, status=status.HTTP_404_NOT_FOUND)    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    