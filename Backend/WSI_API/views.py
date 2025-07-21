# Detalle de documento de vehículo (GET por ID)
from rest_framework.generics import RetrieveAPIView
from rest_framework.generics import DestroyAPIView
from django.http import JsonResponse
from django.utils import timezone
from django.middleware.csrf import get_token
from django.core.mail import EmailMultiAlternatives
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView,CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.authtoken.models import Token
from .models import  ReporteFalla, MotivoMantenimiento, Usuario,NotificacionUsuario, Vehiculo, Mantenimiento, DetalleMantenimiento, DocumentoChofer, DocumentoVehiculo
from .serializers import (ReporteFallaSerializer, DocumentoVehiculoSerializer, DetalleMantenimientoSerializer, MotivoMantenimientoSerializer, NotificacionUsuarioSerializer,DocumentoChoferSerializer, MantenimientoSerializer, PlacaSerializer, EmpleadoSerializer, MecanicoSerializer, VehiculoPlacaSerializer, VehiculoSerializer, RegistroUsuarioSerializer, CustomAuthTokenSerializer, UsuarioSerializer)
from django.utils.decorators import method_decorator
from rest_framework.generics import RetrieveAPIView
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from datetime import date
from django.db.models import Count
from django.conf import settings
from django.utils.crypto import get_random_string

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
    
class VehiculoDetailView(generics.RetrieveUpdateAPIView): # Changed from RetrieveAPIView to RetrieveUpdateAPIView
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [IsAuthenticated] # Ensure IsAuthenticated or appropriate permission
    lookup_field = 'id_vehiculo' # Corrected lookup_field to id_vehiculo
    
class VehiculoUpdateView(RetrieveUpdateAPIView): # This might be the view you intended for the URL
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    lookup_field = 'id_vehiculo' # Corrected lookup_field to id_vehiculo
    permission_classes = [IsAuthenticated]

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
        # Solo usuarios activos (no borrados)
        usuarios = Usuario.objects.filter(rol__in=['1', '2']).filter(borrado__isnull=True)
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
        
class DocumentosChoferListAPIView(APIView):
    def get(self, request):
        chofer_id = request.GET.get('chofer')
        if not chofer_id:
            return Response({'error': 'Debe proporcionar el id del chofer'}, status=status.HTTP_400_BAD_REQUEST)
        documentos = DocumentoChofer.objects.filter(chofer_id=chofer_id)
        serializer = DocumentoChoferSerializer(documentos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class NotificacionesUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notificaciones = NotificacionUsuario.objects.filter(usuario=request.user).order_by('-notificacion__fecha_creacion')
        serializer = NotificacionUsuarioSerializer(notificaciones, many=True)
        return Response(serializer.data)
    
class MarcarNotificacionLeidaView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notificacion_usuario = NotificacionUsuario.objects.get(pk=pk, usuario=request.user)
            notificacion_usuario.leida = True
            notificacion_usuario.fecha_leida = timezone.now()  # <-- Actualiza la fecha de lectura
            notificacion_usuario.save()
            return Response({'success': True})
        except NotificacionUsuario.DoesNotExist:
            return Response({'error': 'Notificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
class MarcarTodasNotificacionesLeidasView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        from django.utils import timezone
        NotificacionUsuario.objects.filter(usuario=request.user, leida=False).update(
            leida=True,
            fecha_leida=timezone.now() 
        )
        return Response({'success': True})
    

class MotivoMantenimientoListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        motivos = MotivoMantenimiento.objects.all()
        serializer = MotivoMantenimientoSerializer(motivos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MotivoMantenimientoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MantenimientoDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            mantenimiento = Mantenimiento.objects.get(pk=pk)
            serializer = DetalleMantenimientoSerializer(mantenimiento)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Mantenimiento.DoesNotExist:
            return Response({'error': 'Mantenimiento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
class UsuarioDetailAPIView(RetrieveUpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = EmpleadoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class DocumentosChoferListAPIView(ListAPIView):
    queryset = DocumentoChofer.objects.all()
    serializer_class = DocumentoChoferSerializer

class VehiculoCreateView(CreateAPIView):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer


# List all vehicle documents (GET)
from rest_framework.generics import ListAPIView

class DocumentoVehiculoListAPIView(ListAPIView):
    queryset = DocumentoVehiculo.objects.all()
    serializer_class = DocumentoVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

# Create vehicle document (POST)
class DocumentoVehiculoCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DocumentoVehiculoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalizar_mantenimiento(request, id):
    try:
        mantenimiento = Mantenimiento.objects.get(pk=id)
    except Mantenimiento.DoesNotExist:
        return Response({'error': 'Mantenimiento no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    suministros = request.data.get('suministros', [])
    observaciones = request.data.get('observaciones', '')

    # 1. Insertar suministros en DetalleMantenimiento
    for s in suministros:
        DetalleMantenimiento.objects.create(
            id_mantenimiento=mantenimiento,
            motivo=s.get('motivo', ''),
            cantidad=s.get('cantidad', 0),
            precio_und=s.get('precio_und', 0),
            total=float(s.get('cantidad', 0)) * float(s.get('precio_und', 0))
        )

    # 2. Actualizar mantenimiento (estado, fecha_terminado, observaciones)
    mantenimiento.estado = 'FINALIZADO'
    mantenimiento.fecha_terminado = date.today()
    mantenimiento.observaciones = observaciones
    mantenimiento.save()

    # 3. Actualizar estado del vehículo a ACTIVO
    vehiculo = mantenimiento.id_vehiculo
    vehiculo.estado = 'ACTIVO'
    vehiculo.save()

    return Response({'success': 'Mantenimiento finalizado correctamente.'}, status=status.HTTP_200_OK)

class VehiculosMasMantenimientosAPIView(APIView):
    def get(self, request):
        # Anota la cantidad de mantenimientos por vehículo y ordena descendente
        vehiculos = Vehiculo.objects.annotate(
            cantidad_mantenimientos=Count('mantenimiento')
        ).order_by('-cantidad_mantenimientos')[:10]  # Top 10

        data = [
            {
                "id": v.id_vehiculo,
                "placa": v.placa,
                "marca": v.marca,
                "modelo": v.modelo,
                "cantidad_mantenimientos": v.cantidad_mantenimientos
            }
            for v in vehiculos
        ]
        return Response(data)


from rest_framework.generics import RetrieveUpdateDestroyAPIView

# ...

class DocumentoChoferDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = DocumentoChofer.objects.all()
    serializer_class = DocumentoChoferSerializer
    lookup_field = 'id_documento_chofer'

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data

        # Buscar información del chofer
        if hasattr(instance, 'chofer_id') and instance.chofer_id:
            try:
                chofer = Usuario.objects.get(pk=instance.chofer_id)
                data['chofer_info'] = {
                    'id': chofer.id,
                    'nombre': chofer.nombre,
                    'apellido': chofer.apellido,
                    'cedula': chofer.cedula
                }
            except Usuario.DoesNotExist:
                data['chofer_info'] = None
        else:
            data['chofer_info'] = None

        # Agregar la ruta del documento (ajusta 'archivo' si tu campo se llama diferente)
        if hasattr(instance, 'archivo') and instance.archivo:
            data['ruta_documento'] = request.build_absolute_uri(instance.archivo.url)
        else:
            data['ruta_documento'] = None

        return Response(data)
    
class CrearReporteFallaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReporteFallaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(id_usuario=request.user)
            return Response({'message': 'Reporte de falla creado correctamente'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteFallaListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reportes = ReporteFalla.objects.select_related('id_vehiculo', 'id_usuario').all().order_by('-fecha_reporte')
        serializer = ReporteFallaSerializer(reportes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar_restaurar_contraseña(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Debe ingresar un correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        usuario = Usuario.objects.get(email=email)
        # Generar token único (puedes usar tu modelo o un campo temporal)
        token = get_random_string(48)
        usuario.reset_token = token
        usuario.save()
        # Construir enlace de restablecimiento
        reset_url = f"http://localhost:5173/reset-password/{token}"
        send_mail(
            subject='Restablecimiento de contraseña - WSI',
            message=f'Hola {usuario.nombre},\n\nPara restablecer tu contraseña haz clic en el siguiente enlace:\n{reset_url}\n\nSi no solicitaste este cambio, ignora este correo.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario.email],
            fail_silently=False,
        )
        return Response({'message': 'Se ha enviado un enlace de restablecimiento a tu correo.'}, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response({'error': 'Correo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def restablecer_contraseña(request):
    token = request.data.get('token')
    nueva_contraseña = request.data.get('password')
    if not token or not nueva_contraseña:
        return Response({'error': 'Token y nueva contraseña requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        usuario = Usuario.objects.get(reset_token=token)
        usuario.set_password(nueva_contraseña)
        usuario.reset_token = None
        usuario.save()
        return Response({'message': 'Contraseña restablecida correctamente.'}, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response({'error': 'Token inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

# Vista para borrado lógico de empleados
class UsuarioDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            usuario = Usuario.objects.get(id=id)
            usuario.delete()  # Esto marca como borrado
            return Response({'success': 'Empleado eliminado correctamente.'}, status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response({'error': 'Empleado no encontrado.'}, status=status.HTTP_404_NOT_FOUND)


class DocumentoVehiculoDetailAPIView(RetrieveAPIView):
    queryset = DocumentoVehiculo.objects.all()
    serializer_class = DocumentoVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_documento_vehiculo'





























