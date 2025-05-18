import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RecuperarContraseña from './components/RecuperarContraseña';
import Home from './components/Home';
import RegistroEmpleado from './components/RegistroEmpleado';
import RegistroVehiculo from './components/RegistroVehiculo';
import RegistroDocumentosVehiculo from './components/RegistroDocumentosVehiculo';
import VerVehiculos from './components/VerVehiculos';
import DetalleVehiculo from './components/DetallesVehiculo';

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


      </Routes>
    </Router>
  );
};

export default App;

