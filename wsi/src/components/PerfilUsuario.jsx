// PerfilUsuario.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faPhone, faIdCard, faUserTie, faCalendar, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import '../styles/PerfilUsuario.css';
import bgImage from '../assets/bg-login.jpg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken } from "../services/auth";

const PerfilUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  
  // Verificar token y rol del usuario
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          // Permitir acceso a todos los roles
          return;
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();
  }, [navigate]);

  // Obtener datos del usuario actual desde la API
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }
    // Usar verifyToken para obtener el id del usuario logueado
    verifyToken().then(result => {
      if (result.isValid && result.user && result.user.id) {
        fetch(`http://localhost:8000/api/detalle-usuarios/${result.user.id}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
          .then(res => {
            if (!res.ok) throw new Error('No se pudo obtener el perfil');
            return res.json();
          })
          .then(data => {
            setUsuario(data);
            setEmail(data.email);
            setTelefono(data.telefono);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
            toast.error('No se pudo cargar la información del usuario');
          });
      } else {
        toast.error('No se pudo identificar el usuario.');
        logout();
      }
    }).catch(() => {
      toast.error('No se pudo identificar el usuario.');
      logout();
    });
  }, []);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  const getTipoCedula = (tipo) => {
    switch(tipo) {
      case 'V': return 'Venezolano';
      case 'E': return 'Extranjero';
      case 'P': return 'Pasaporte';
      default: return tipo;
    }
  };

  const getRolNombre = (rol) => {
    if (rol == 1 || rol === '1') return 'Supervisor';
    if (rol == 2 || rol === '2') return 'Empleado';
    return rol;
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const handleVolver = () => {
    navigate(-1); // Volver a la página anterior
  };

  // Actualizar datos del usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario) return;
    // Validaciones
    if (password && password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password && password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!email) {
      toast.error('El correo electrónico es obligatorio');
      return;
    }
    if (!telefono) {
      toast.error('El número de teléfono es obligatorio');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    const payload = {
      email,
      telefono,
    };
    if (password) payload.password = password;
    try {
      const res = await fetch(`http://localhost:8000/api/detalle-usuarios/${usuario.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al actualizar el perfil');
      }
      const updated = await res.json();
      setUsuario(updated);
      setPassword('');
      setConfirmPassword('');
      toast.success('Cambios guardados con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <div className="perfil-loader-container">
        <div className="perfil-loader"></div>
        <p>Cargando perfil...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="perfil-home-wrapper">
        <div className="perfil-bg">
          <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
        </div>
        <Header title="WSI" />
        <div className="perfil-usuario-container">
          <div className="perfil-usuario-card">
            <h2 className="perfil-usuario-titulo">Error al cargar el perfil</h2>
            <p>No se pudo cargar la información de tu perfil.</p>
            <button className="perfil-usuario-boton-volver" onClick={handleVolver}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
              Volver
            </button>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="perfil-home-wrapper">
      {/* Imagen de fondo */}
      <div className="perfil-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />
      
      <div className="perfil-usuario-container">
        <div className="perfil-usuario-card">
          <div className="perfil-usuario-header">
            <h2 className="perfil-usuario-titulo">Mi Perfil</h2>
          </div>
          
          <div className="perfil-usuario-profile">
            <div className="perfil-avatar-iniciales">
              {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
            </div>
            <div className="perfil-usuario-nombre">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className={`perfil-usuario-rol ${usuario.rol == 1 || usuario.rol === '1' ? 'rol-supervisor' : 'rol-empleado'}`}>
              {getRolNombre(usuario.rol)}
            </div>
          </div>
          
          <div className="perfil-usuario-info-grid">
            <div className="perfil-info-card">
              <div className="perfil-info-icon">
                <FontAwesomeIcon icon={faIdCard} />
              </div>
              <div className="perfil-info-content">
                <h3>Información Personal</h3>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">Tipo de Documento:</span>
                  <span className="perfil-info-value">{getTipoCedula(usuario.tipoCedula)}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">Cédula:</span>
                  <span className="perfil-info-value">{usuario.cedula}</span>
                </div>
              </div>
            </div>
            
            <div className="perfil-info-card">
              <div className="perfil-info-icon">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <div className="perfil-info-content">
                <h3>Información Laboral</h3>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">Cargo:</span>
                  <span className="perfil-info-value">{getRolNombre(usuario.rol)}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">Fecha de Registro:</span>
                  <span className="perfil-info-value">{formatFecha(usuario.fechaRegistro)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <form className="perfil-form" onSubmit={handleSubmit}>
            <h3 className="perfil-form-titulo">Actualizar Información</h3>
            
            <div className="perfil-form-group">
              <label className="perfil-form-label">
                <FontAwesomeIcon icon={faEnvelope} className="perfil-form-icon" />
                Correo Electrónico
              </label>
              <input
                type="email"
                className="perfil-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="perfil-form-group">
              <label className="perfil-form-label">
                <FontAwesomeIcon icon={faLock} className="perfil-form-icon" />
                Nueva Contraseña
              </label>
              <div className="perfil-form-password">
                <input
                  type={showPassword ? "text" : "password"}
                  className="perfil-form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar vacío para mantener la actual"
                />
                <button 
                  type="button" 
                  className="perfil-password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            
            <div className="perfil-form-group">
              <label className="perfil-form-label">
                <FontAwesomeIcon icon={faLock} className="perfil-form-icon" />
                Confirmar Contraseña
              </label>
              <div className="perfil-form-password">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="perfil-form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
                <button 
                  type="button" 
                  className="perfil-password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            
            <div className="perfil-form-group">
              <label className="perfil-form-label">
                <FontAwesomeIcon icon={faPhone} className="perfil-form-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                className="perfil-form-input"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="perfil-form-button">
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PerfilUsuario;