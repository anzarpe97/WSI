import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import {
  faCar, faUser, faWrench, faChartPie, faChartBar, faIdCardClip, faIdCard,
  faCarBurst, faPeopleGroup, faScrewdriverWrench, faFileContract, faCog, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../../services/auth';
import UserHeader from '../Home-Header';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: '', apellido: '', rol: 0 });
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
    document.title = "WSI - Home";
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          if (String(result.user.rol) !== "0") {
            if (String(result.user.rol) === "1") {
              navigate('/supervisorHome', { replace: true });
            } else if (String(result.user.rol) === "2") {
              navigate('/employee-dashboard', { replace: true });
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

  // Cards organizadas en filas lógicas
  return (
    <div className="home-wrapper">
      <UserHeader 
        userName={`${user.nombre}`} 
        title="WSI"
        showIcons={true}
        userRole={user.rol} // <-- Envía el rol aquí
      />

      <div className="home-content">
        <div className="home-grid">
          {/* Registro */}
          <Link to="/registro-vehiculo" className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Registro de Vehículos</p>
          </Link>
          <Link to="/registro-empleado" className="home-card">
            <FontAwesomeIcon icon={faUser} size="3x" />
            <p>Registro de Empleados</p>
          </Link>
          <Link to="/registro-mantenimiento" className="home-card">
            <FontAwesomeIcon icon={faWrench} size="3x" />
            <p>Registro de Mantenimientos</p>
          </Link>
          <Link to="/menu-documentos" className="home-card">
            <FontAwesomeIcon icon={faIdCard} size="3x" />
            <p>Registro de Documentos</p>
          </Link>
      
          <Link to="/estadisticas" className="home-card">
            <FontAwesomeIcon icon={faChartPie} size="3x" />
            <p>Estadísticas y Reportes</p>
          </Link>

          {/* Gestión */}
          <Link to="/ver-vehiculos" className="home-card">
            <FontAwesomeIcon icon={faCarBurst} size="3x" />
            <p>Gestión de Vehículos</p>
          </Link>
          <Link to="/gestion-empleados" className="home-card">
            <FontAwesomeIcon icon={faPeopleGroup} size="3x" />
            <p>Gestión de Empleados</p>
          </Link>
          <Link to="/gestion-mantenimiento" className="home-card">
            <FontAwesomeIcon icon={faScrewdriverWrench} size="3x"/>
            <p>Gestión de Mantenimiento</p>
          </Link>
          <Link to="/menu-gestion-documentos" className="home-card">
            <FontAwesomeIcon icon={faIdCardClip} size="3x" />
            <p>Gestión de Documentos</p>
          </Link>
          {/* Nueva Card: Ver Fallas */}
          <Link to="/ver-fallas" className="home-card">
            <FontAwesomeIcon icon={faTriangleExclamation} size="3x" style={{color: "#fff"}} />
            <p>Visualizar Fallas</p>
          </Link>
          
        </div>
      </div>

      <div className="home-bg">
        <img src={bgImage} alt="Fondo Home" onError={(e) => (e.target.style.display = 'none')} />
      </div>
    </div>
  );
};

export default Home;