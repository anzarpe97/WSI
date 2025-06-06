import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // 🔑 SOLUCIÓN 1: Verificación Simple al Cargar el Login
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Verificar si hay token almacenado
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log('🔍 Token encontrado, verificando validez...');
          
          // Verificar si el token es válido con el backend
          const result = await verifyToken();
          
          if (result.isValid && result.user) {
            // ✅ Sesión válida encontrada - Redirigir según el rol
            const userRole = parseInt(result.user.rol);
            
            console.log('🔄 Sesión activa detectada, redirigiendo...', result.user);
            
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
                // Rol no reconocido, limpiar token
                console.warn('⚠️ Rol no reconocido:', userRole);
                localStorage.removeItem('token');
            }
            return; // Salir temprano si hay redirección
          } else {
            // Token inválido, limpiar
            console.log('❌ Token inválido, limpiando...');
            localStorage.removeItem('token');
          }
        }
        
        // Si llegamos aquí, no hay sesión válida
        console.log('ℹ️ No hay sesión activa, mostrando login');
        
      } catch (error) {
        // Error al verificar sesión, limpiar por seguridad
        console.error('❌ Error verificando sesión:', error);
        localStorage.removeItem('token');
      } finally {
        // Permitir que se muestre el login
        setIsCheckingAuth(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  // Mostrar spinner mientras verifica si hay sesión activa
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

    setIsLoading(true);    try {
      // 1. Solicita token CSRF desde backend
      const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
        credentials: 'include',
      });
      const csrfData = await csrfResponse.json();
      const csrftoken = csrfData.csrfToken;

      // 2. Envía login con token CSRF recibido
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;