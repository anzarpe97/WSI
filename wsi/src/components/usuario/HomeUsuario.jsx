import React, { useEffect, useState, useRef } from 'react';
import '../../styles/home.css';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faUser,
  faWrench,
  faChartBar,
  faIdCardClip,
  faIdCard,
  faCarBurst,
  faPeopleGroup,
  faScrewdriverWrench,
  faFileContract,
  faCog,
  faExclamationTriangle,
  faClipboard
} from '@fortawesome/free-solid-svg-icons';
import UserHeader from '../Home-Header';
import bgImage from '../../assets/bg-login.jpg';
import { toast } from 'react-toastify';
import { verifyToken } from '../../services/auth';

const HomeUsuario = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: 'Usuario', apellido: '', rol: 2 });
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  // Verificar token al montar el componente
  useEffect(() => {
    document.title = "WSI - Usuario";
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          if (String(result.user.rol) !== "2") {
            if (String(result.user.rol) === "0") {
              navigate('/adminHome', { replace: true });
            } else if (String(result.user.rol) === "1") {
              navigate('/supervisorHome', { replace: true });
            } else {
              logout();
            }
            return;
          }
          setUser({
            nombre: result.user.nombre,
            apellido: result.user.apellido,
            rol: result.user.rol
          });
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Manejar inactividad
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 1200000); // 20 minutos
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      {/* Header con Home-Header */}
      <UserHeader 
        userName={`${user.nombre}`} 
        title="WSI"
        showIcons={true}
        userRole={user.rol} 
      />

      {/* Contenido principal */}
      <div className="home-content">
        <div className="home-grid">
          {/* Visualizar estadísticas */}
          <Link to="/estadisticas" className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Visualizar estadísticas</p>
          </Link>

          {/* Visualizar registros */}
          <Link to="/gestion-mantenimiento" className="home-card">
            <FontAwesomeIcon icon={faFileContract} size="3x" />
            <p>Gestion de Mantenimiento</p>
          </Link>

          {/* Visualizar vehículos */}
          <Link to="/ver-vehiculos" className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Gestion de Vehículos</p>
          </Link>

          {/* Reportar falla */}
          <Link to="/ver-fallas" className="home-card">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>Reportar falla</p>
          </Link>
        </div>
      </div>

      {/* Fondo */}
      <div className="home-bg">
        <img src={bgImage} alt="Fondo Home" onError={(e) => (e.target.style.display = 'none')} />
      </div>
    </div>
  );
};

export default HomeUsuario;