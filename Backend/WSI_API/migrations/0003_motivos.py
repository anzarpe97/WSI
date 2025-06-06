from django.db import migrations

def crear_motivos(apps, schema_editor):
    MotivoMantenimiento = apps.get_model('WSI_API', 'MotivoMantenimiento')
    motivos = [
        "Cambio de Aceite y Filtros",
        "Cambio de Correa del motor",
        "Cambio de Correa del compresor de aire",
        "Cambio de Correa del alternador",
        "Cambio de Correa multicanal del motor",
        "Cambio de Filtro de purificador de Aire",
        "Reemplazo o Servicio de Inyectores",
        "Reemplazo o Servicio a Bomba de Inyección",
        "Engrase de puntos de lubricación",
        "Sustitución de Bujías",
        "Cambio de Pastillas y Discos de Freno",
        "Reparación o Sustitución del Alternador",
        "Cambio de Amortiguadores",
        "Revisión o Cambio de la empacadura de la cámara de compresión",
        "Cambio del Embrague",
        "Sustitución del Termostato",
        "Cambio de Líquido de Frenos",
        "Reparación o Cambio del Turbo",
        "Cambio de Filtro de Combustible",
        "Sustitución o reparación del Sistema de Escape",
        "Reparación de la Transmisión",
        "Cambio de Neumáticos",
        "Reparación de Neumáticos",
        "Cambio del Filtro de Partículas",
        "Reparación del Sistema de Dirección",
        "Cambio de Rodamientos de artillerías",
        "Cambio de la Empacadura del Cárter",
        "Alineación del tren delantero",
    ]
    for motivo in motivos:
        MotivoMantenimiento.objects.get_or_create(motivo=motivo)

class Migration(migrations.Migration):

    dependencies = [
        # Asegúrate de poner aquí la última migración de tu app, por ejemplo:
        ('WSI_API', '0002_alter_usuario_telefono'),
    ]

    operations = [
        migrations.RunPython(crear_motivos),
    ]