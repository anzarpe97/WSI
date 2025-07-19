import React, { useState } from 'react';
import '../components/ResetPassword.css';
import bg from '../assets/bg-login.jpg';
import camion from '../assets/camion-login.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Ingrese y confirme la nueva contraseña');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
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
        setSuccess(true);
        toast.success('Contraseña restablecida correctamente. Ya puede iniciar sesión.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.error || 'Token inválido o expirado');
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <header className="reset-header">
        <h1>WSI</h1>
      </header>

      <div className="reset-card">
        <form className="reset-form" onSubmit={handleReset}>
          <h2 style={{marginBottom: 20}}>Restablecer Contraseña</h2>
          {success ? (
            <div className="reset-success">¡Contraseña cambiada con éxito! Redirigiendo al login...</div>
          ) : (
            <>
              {error && <div className="reset-error">{error}</div>}
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Ingrese la nueva contraseña"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirme la nueva contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button className='reset-btn' type="submit" disabled={isLoading}>
                {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </>
          )}
        </form>
        <div className="reset-image">
          <img
            src={camion}
            alt="Camión de transporte"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      </div>

      <div className="reset-bg">
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

export default ResetPassword;
