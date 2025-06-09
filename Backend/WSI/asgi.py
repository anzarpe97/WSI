import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from WSI_API.token_auth_middleware import TokenAuthMiddlewareStack
import WSI_API.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WSI.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddlewareStack(
        URLRouter(
            WSI_API.routing.websocket_urlpatterns
        )
    ),
})