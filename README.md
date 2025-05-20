# WSI

## Descripción del Proyecto

Este proyecto es una **aplicación web integral** para la gestión de vehículos, empleados y órdenes de mantenimiento, desarrollada con un stack moderno compuesto por **Django** en el backend y **React** en el frontend. Está diseñada para empresas o talleres que requieren una solución robusta y centralizada para administrar su flota vehicular y personal técnico.

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

### 🔍 Funcionalidades Clave

- Autenticación y autorización mediante token (login/logout y protección de rutas).
- Gestión de empleados: alta, modificación, eliminación y búsqueda avanzada.
- Gestión de vehículos: registro, edición, baja lógica y visualización de estado operativo.
- Administración de órdenes de mantenimiento, con:
  - Asignación de mecánicos responsables.
  - Registro de materiales e insumos.
  - Control de estado y seguimiento histórico.
- UI responsiva adaptada a distintos dispositivos.
- Control de acceso basado en roles (administradores vs usuarios operativos).

> El sistema está orientado a mejorar la trazabilidad, eficiencia y digitalización de procesos en organizaciones que dependen del mantenimiento vehicular y la coordinación de equipos técnicos.
