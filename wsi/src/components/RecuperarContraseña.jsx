import React from 'react';
import '../styles/login.css';
import bg from '../assets/bg-login.jpg'; // Asegúrate de que esta imagen exista
import camion from '../assets/camion-login.png'; // Asegúrate de que esta imagen exista

const RecuperarContraseña = () => {
  console.log('🔸 RecuperarContraseña renderizado');
  return (
    <div className="login-wrapper">
      <header className="login-header">
        <h1>WSI</h1>
      </header>

      <div className="login-card">
        <div className="login-form">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Ingrese su correo electrónico"
          />

          <button className='recuperar'>Enviar</button>
        </div>

        <div className="login-image">
          <img
            src={camion}
            alt="Camión de transporte"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      </div>

      <div className="login-bg">
        <img
          src={bg}
          alt="Fondo login"
          onError={(e) => (e.target.style.display = 'none')}
        />
      </div>
    </div>
  );
};

export default RecuperarContraseña;