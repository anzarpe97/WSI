import React, { useState } from 'react';
import '../styles/login.css';
import bg from '../assets/bg-login.jpg';
import camion from '../assets/camion-login.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'reset'
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
        setStep('reset');
      } else {
        toast.error(data.error || 'Correo no encontrado');
      }
    } catch (error) {
      toast.error('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Restablecer contraseña usando el token
  const handleReset = async (e) => {
    e.preventDefault();
    if (!token.trim() || !newPassword.trim()) {
      toast.error('Ingrese el token y la nueva contraseña');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/restablecer-contraseña/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Contraseña restablecida correctamente. Ya puede iniciar sesión.');
        setStep('request');
        setEmail('');
        setToken('');
        setNewPassword('');
      } else {
        toast.error(data.error || 'Token inválido o expirado');
      }
    } catch (error) {
      toast.error('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Permitir volver a solicitar el enlace si el usuario lo necesita
  const handleBackToRequest = () => {
    setStep('request');
    setToken('');
    setNewPassword('');
  };

  return (
    <div className="login-wrapper">
      <header className="login-header">
        <h1>WSI</h1>
      </header>

      <div className="login-card">
        {step === 'request' ? (
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
        ) : (
          <form className="login-form" onSubmit={handleReset}>
            <label htmlFor="token">Token de restablecimiento</label>
            <input
              id="token"
              type="text"
              placeholder="Pega aquí el token recibido por correo"
              value={token}
              onChange={e => setToken(e.target.value)}
              autoComplete="off"
            />
            <label htmlFor="newPassword">Nueva contraseña</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Ingrese la nueva contraseña"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button className='recuperar' type="submit" disabled={isLoading}>
              {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
            <button
              type="button"
              className="recuperar"
              style={{ marginTop: 10, background: "#eee", color: "#333" }}
              onClick={handleBackToRequest}
              disabled={isLoading}
            >
              Volver a solicitar enlace
            </button>
          </form>
        )}

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