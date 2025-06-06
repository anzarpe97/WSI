import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import bg from '../assets/bg-login.jpg';
import camion from '../assets/camion-login.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken } from '../services/auth';

const Login = () => {
  document.title = 'WSI - Login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showInactivityModal, setShowInactivityModal] = useState(false); // NUEVO
  const navigate = useNavigate();
  const location = useLocation(); // NUEVO

  useEffect(() => {
    // Mostrar modal si la sesión expiró por inactividad
    if (location.state && location.state.sessionExpired) {
      setShowInactivityModal(true);
      // Limpia el estado para que no se muestre siempre
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const result = await verifyToken();
          if (result.isValid && result.user) {
            const userRole = parseInt(result.user.rol);
            switch (userRole) {
              case 0:
                navigate('/adminHome', { replace: true });
                break;
              case 1:
                navigate('/supervisor-dashboard', { replace: true });
                break;
              case 2:
                navigate('/employee-dashboard', { replace: true });
                break;
              default:
                localStorage.removeItem('token');
            }
            return;
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkExistingSession();
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="login-wrapper" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ 
            marginTop: '20px', 
            color: '#666', 
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif'
          }}>
            🔍 Verificando sesión existente...
          </p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) errors.email = 'El correo es obligatorio.';
    else if (!emailRegex.test(email)) errors.email = 'El correo no tiene un formato válido.';
    if (!password) errors.password = 'La contraseña es obligatoria.';
    else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors).join(' '));
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
        credentials: 'include',
      });
      const csrfData = await csrfResponse.json();
      const csrftoken = csrfData.csrfToken;
      const response = await fetch('http://localhost:8000/api/login/', {
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
        toast.success('Inicio de sesión exitoso');
        setTimeout(() => {
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
              toast.error('Rol no reconocido');
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al iniciar sesión');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <Link to="/recuperar-contraseña" className="forgot-password">
            ¿Olvidó su contraseña?
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? "with-text" : ""}
          >
            {isLoading ? (
              <>
                Cargando...
                <span className="loader-with-text"></span>
              </>
            ) : (
              'Iniciar sesión'
            )}
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

      {showInactivityModal && (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-header">
        <h2>Sesión expirada</h2>
      </div>
      <div className="modal-body">
        <div className="modal-icon">
          <div className="modal-icon-inner">
            <svg viewBox="0 0 24 24">
              <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M13,17h-2v-2h2V17z M13,13h-2V7h2V13z"/>
            </svg>
          </div>
        </div>
        <p>Tu sesión se ha cerrado por inactividad.</p>
        <p>Inicie sesión nuevamente.</p>
      </div>
      <div className="modal-footer">
        <button 
          className="modal-button"
          onClick={() => setShowInactivityModal(false)}
        >
          Entendido
        </button>
      </div>
    </div>
  </div>
)}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;