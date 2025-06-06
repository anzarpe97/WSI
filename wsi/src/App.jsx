import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RecuperarContraseña from './components/RecuperarContraseña';
import Home from './components/admin/Home';
import RegistroEmpleado from './components/admin/RegistroEmpleado';
import RegistroVehiculo from './components/admin/RegistroVehiculo';
import RegistroDocumentosVehiculo from './components/admin/RegistroDocumentosVehiculo';
import VerVehiculos from './components/admin/VerVehiculos';
import DetalleVehiculo from './components/admin/DetallesVehiculo';
import RegistroMantenimiento from './components/admin/RegistroMantenimiento';
import GestionEmpleados from './components/admin/GestionEmpleados';
import GestionMantenimiento from './components/admin/GestionManteminimento';
import EditarVehiculo from './components/admin/EditarVehiculo';
import MenuDocumentos from './components/admin/MenuDocumentos';
import RegistroDocumentoChoferes from './components/admin/RegistroDocumentoChoferes';
import RegistroDocumentosVehiculos from './components/admin/RegistroDocumentosVehiculos,';
import HomeSupervisor from './components/supervisor/HomeSupervisor';
import Estadisticas from './components/admin/Estadisticas';

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
        {/* RUTAS DOCUMENTOS ADMINISTRADOR*/}
        <Route path="/menu-documentos" element={<MenuDocumentos />} />
        <Route path="/registro-documentos-vehiculo" element={<RegistroDocumentosVehiculos />} />
        <Route path="/registro-documentos-choferes" element={<RegistroDocumentoChoferes />} />
        {/* RUTAS VEHICULOS ADMINISTRADOR*/}
        <Route path="/registro-vehiculo" element={<RegistroVehiculo />} />
        <Route path="/editar-vehiculo/:id" element={<EditarVehiculo />} />
        <Route path="/ver-vehiculos" element={<VerVehiculos />} />
        <Route path="/detalle-vehiculo/:id" element={<DetalleVehiculo />} />
        {/* RUTAS MANTENIMIENTO ADMINISTRADOR*/}        
        <Route path="/registro-mantenimiento" element={<RegistroMantenimiento />} />
        <Route path="/gestion-mantenimiento" element={<GestionMantenimiento />} />
        {/* RUTAS MANTENIMIENTO ADMINISTRADOR*/}        
        <Route path="/estadisticas" element={<Estadisticas />} />
        {/* RUTAS DOCUMENTOS VEHICULOS ADMINISTRADOR*/}      
        {/* RUTAS SUPERVISOR*/}     
        <Route path="/supervisorHome" element={<HomeSupervisor />} />
        {/* RUTAS USUARIO*/}

      </Routes>
    </Router>
  );
};

export default App;

