import React, { useState } from 'react';
import '../styles/login.css';
import bg from '../assets/bg-login.jpg';
import camion from '../assets/camion-login.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Solicitar enlace de restablecimiento
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Ingrese su correo electrónico');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/solicitar-restablecimiento/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Revisa tu correo para el enlace de restablecimiento.');
        setEmail('');
      } else {
        toast.error(data.error || 'Correo no encontrado');
      }
    } catch (error) {
      toast.error('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <header className="login-header">
        <h1>WSI</h1>
      </header>

      <div className="login-card">
        <form className="login-form" onSubmit={handleRequest}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Ingrese su correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button className='recuperar' type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RecuperarContraseña;