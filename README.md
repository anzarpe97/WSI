# WSI

## Descripción del Proyecto

Este proyecto corresponde a una tesis de grado y consiste en una **aplicación web** para la gestión centralizada de flotas vehiculares, recursos humanos y órdenes de mantenimiento, desarrollada para la empresa **World Service International**. La solución está construida sobre un stack tecnológico moderno, empleando **Django** y **Django REST Framework** para el backend (API RESTful, autenticación basada en tokens, ORM robusto) y **React** para el frontend (SPA, UI responsiva, consumo eficiente de APIs).

### 🛠️ Backend (Django + DRF)

El backend implementa una **API RESTful** utilizando **Django REST Framework**, con autenticación basada en **tokens estándar** (`TokenAuthentication`). La API expone endpoints seguros que permiten operaciones **CRUD completas** sobre las siguientes entidades:

- **Usuarios** (empleados y administradores)
- **Vehículos**
- **Órdenes de mantenimiento**

Se aplican controles de acceso y validaciones en capa de modelo y vista para garantizar la integridad de los datos y restringir acciones según el rol del usuario.

### 💻 Frontend (React)

El frontend, desarrollado con **React**, proporciona una interfaz de usuario **moderna y responsiva**, conectada al backend mediante llamadas a la API. Sus principales características incluyen:

- **Formularios dinámicos** con validación en el cliente.
- **Tablas interactivas** para gestión y visualización de registros.
- **Control de sesión** persistente mediante almacenamiento de tokens.
- **Rutas protegidas** basadas en la autenticación del usuario.
