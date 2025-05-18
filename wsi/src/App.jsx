import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RecuperarContraseña from './components/RecuperarContraseña';
import Home from './components/Home';
import RegistroEmpleado from './components/RegistroEmpleado';
import RegistroVehiculo from './components/RegistroVehiculo';
import RegistroDocumentosVehiculo from './components/RegistroDocumentosVehiculo';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminHome" element={<Home />} />
        <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
        <Route path="/registro-empleado" element={<RegistroEmpleado />} />
        <Route path="/registro-documentos-vehiculo" element={<RegistroDocumentosVehiculo />} />
        <Route path="/registro-vehiculo" element={<RegistroVehiculo />} />


      </Routes>
    </Router>
  );
};

export default App;

