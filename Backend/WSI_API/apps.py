from django.apps import AppConfig

class WsiApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'WSI_API'

    def ready(self):
        import WSI_API.signals  # Importa los signals dentro del método ready()