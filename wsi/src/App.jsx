import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RecuperarContraseña from './components/RecuperarContraseña';
import Home from './components/admin/Home';
import DetalleDocumentoChofer from './components/admin/documentos-choferes/DetalleDocmentoChofer';
import RegistroEmpleado from './components/admin/empleados/RegistroEmpleado';
import RegistroVehiculo from './components/admin/vehiculos/RegistroVehiculo';
import VerVehiculos from './components/admin/vehiculos/VerVehiculos';
import DetalleVehiculo from './components/admin/vehiculos/DetallesVehiculo';
import RegistroMantenimiento from './components/admin/mantenimientos/RegistroMantenimiento';
import GestionEmpleados from './components/admin/empleados/GestionEmpleados';
import GestionMantenimiento from './components/admin/mantenimientos/GestionManteminimento';
import EditarVehiculo from './components/admin/vehiculos/EditarVehiculo';
import MenuDocumentos from './components/admin/MenuDocumentos';
import RegistroDocumentoChoferes from './components/admin/documentos-choferes/RegistroDocumentoChoferes';
import RegistroDocumentosVehiculos from './components/admin/documentos-vehiculos/RegistroDocumentosVehiculos';
import HomeSupervisor from './components/supervisor/HomeSupervisor';
import Estadisticas from './components/admin/Estadisticas';
import MenuGestionDocumentos from './components/admin/MenuGestionDocumentos';
import VerDocumentoVehiculos from './components/admin/documentos-vehiculos/VerDocumentoVehiculos';
import DetalleMantenimiento from './components/admin/mantenimientos/DetalleMantenimiento';
import DetalleEmpleado from './components/admin/empleados/DetalleEmpleados';
import Notificaciones from './components/Notificaciones';
import GestionDocumentoChoferes from './components/admin/documentos-choferes/GestionDocumentoChoferes';
import FinalizarMantenimiento from './components/admin/mantenimientos/FinalizarMantinimento';
import PerfilUsuario from './components/PerfilUsuario';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* RUTAS ADMINISTRADOR*/}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminHome" element={<Home />} />
        <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
        {/* RUTAS EMPLEADOS ADMINISTRADOR*/}
        <Route path="/registro-empleado" element={<RegistroEmpleado />} />
        <Route path="/gestion-empleados" element={<GestionEmpleados />} />
        <Route path="/detalle-empleado/:id" element={<DetalleEmpleado />} />
        {/* RUTAS DOCUMENTOS ADMINISTRADOR*/}
        <Route path="/detalle-documento-chofer/:id" element={<DetalleDocumentoChofer />} />
        <Route path="/menu-documentos" element={<MenuDocumentos />} />
        <Route path="/menu-gestion-documentos" element={<MenuGestionDocumentos />} />
        <Route path="/ver-documentos-vehiculos" element={<VerDocumentoVehiculos />} />
        <Route path="/gestion-documento-choferes" element={<GestionDocumentoChoferes />} />
        <Route path="/registro-documentos-vehiculo" element={<RegistroDocumentosVehiculos />} />
        <Route path="/registro-documentos-choferes" element={<RegistroDocumentoChoferes />} />
        {/* RUTAS VEHICULOS ADMINISTRADOR*/}
        <Route path="/registro-vehiculo" element={<RegistroVehiculo />} />
        <Route path="/editar-vehiculo/:id" element={<EditarVehiculo />} />
        <Route path="/ver-vehiculos" element={<VerVehiculos />} />
        <Route path="/detalle-vehiculo/:id" element={<DetalleVehiculo />} />
        {/* RUTAS MANTENIMIENTO ADMINISTRADOR*/}     
        <Route path="/finalizar-mantenimiento/:id" element={<FinalizarMantenimiento />} />   
        <Route path="/registro-mantenimiento" element={<RegistroMantenimiento />} />
        <Route path="/gestion-mantenimiento" element={<GestionMantenimiento />} />
        <Route path="/detalle-mantenimiento/:id" element={<DetalleMantenimiento />} />
        {/* RUTAS MANTENIMIENTO ADMINISTRADOR*/}        
        <Route path="/estadisticas" element={<Estadisticas />} />
        {/* RUTAS DOCUMENTOS VEHICULOS ADMINISTRADOR*/}      
        {/* RUTAS SUPERVISOR*/}     
        <Route path="/supervisorHome" element={<HomeSupervisor />} />
        {/* RUTAS USUARIO*/}
        <Route path="/perfil-usuario" element={<PerfilUsuario />} />
        {/* RUTAS NOTIFICACIONES*/}
        <Route path="/notificaciones" element={<Notificaciones />} />

      </Routes>
    </Router>
  );
};

export default App;

