import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import bg from '../assets/bg-login.jpg';
import camion from '../assets/camion-login.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) errors.email = 'El correo es obligatorio.';
    else if (!emailRegex.test(email)) errors.email = 'El correo no tiene un formato válido.';

    if (!password) errors.password = 'La contraseña es obligatoria.';
    else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors).join(' '));
      setShowNotification(true);
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowNotification(false);

    if (!validateForm()) return;

    try {
      // 1. Solicita token CSRF desde backend
      const csrfResponse = await fetch('http://127.0.0.1:8000/api/csrf/', {
        credentials: 'include',
      });
      const csrfData = await csrfResponse.json();
      const csrftoken = csrfData.csrfToken;

      // 2. Envía login con token CSRF recibido
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);

        switch (parseInt(data.user.rol)) {
          case 0:
            navigate('/adminHome', { state: { data } });
            break;
          case 1:
            navigate('/supervisor-dashboard', { state: { data } });
            break;
          case 2:
            navigate('/employee-dashboard', { state: { data } });
            break;
          default:
            setError('Rol no reconocido');
            setShowNotification(true);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al iniciar sesión');
        setShowNotification(true);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setShowNotification(true);
    }
  };


  return (
    <div className="login-wrapper">
      <header className="login-header">
        <h1>WSI</h1>
      </header>

      <div className="login-card">
        <form className="login-form" onSubmit={handleLogin}>
          <label>Iniciar Sesión</label>
          <input
            type="email"
            placeholder="Ingrese su correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'} // Alterna entre 'text' y 'password'
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye} // Cambia el ícono según el estado
              className="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)} // Alterna el estado
            />
          </div>


          <Link to="/recuperar-contraseña" className="forgot-password">
            ¿Olvidó su contraseña?
          </Link>
          <button type="submit">Iniciar sesión</button>
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

      {showNotification && (
        <div className="notification">
          <span className="notification-close" onClick={() => setShowNotification(false)}>
            &times;
          </span>
          <p className="notification-title">Error</p>
          <p className="notification-message">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Login;