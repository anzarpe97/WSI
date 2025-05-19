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

const App = () => {
  return (
    <Router>
      <Routes>

        {/* RUTAS ADMINISTRADOR*/}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminHome" element={<Home />} />
        <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
        <Route path="/registro-empleado" element={<RegistroEmpleado />} />
        <Route path="/registro-documentos-vehiculo" element={<RegistroDocumentosVehiculo />} />
        <Route path="/registro-vehiculo" element={<RegistroVehiculo />} />
        <Route path="/ver-vehiculos" element={<VerVehiculos />} />
        <Route path="/detalle-vehiculo/:id" element={<DetalleVehiculo />} />
        
        {/* RUTAS ADMINISTRADOR*/}
        
        {/* RUTAS ADMINISTRADOR*/}

      </Routes>
    </Router>
  );
};

export default App;

