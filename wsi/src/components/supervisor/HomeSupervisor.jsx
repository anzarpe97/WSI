import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUser, faWrench, faChartBar, faBell, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import bgImage from '../../assets/bg-login.jpg';
import UserHeader from '../Home-Header';
import { verifyToken } from '../../services/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomeSupervisor = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  const [user, setUser] = useState(null);

  // Cerrar sesión
  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  // Verificar token y rol al montar
  useEffect(() => {
    document.title = "WSI - Supervisor";
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          setUser(result.user);
          // Si el rol no es 1, redirige al home correspondiente
          if (String(result.user.rol) !== "1") {
            if (String(result.user.rol) === "0") {
              navigate('/adminHome', { replace: true });
            } else if (String(result.user.rol) === "2") {
              navigate('/employee-dashboard', { replace: true });
            } else {
              logout();
            }
            return;
          }
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();

    // --- Temporizador de inactividad ---
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
    // --- Fin temporizador ---
  }, [navigate]);

  // Manejar logout desde el icono
  const handleLogoutClick = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
      <UserHeader 
        userName={`${user.nombre}`} 
        title="WSI"
        showIcons={true}
      />

      <div className="home-content">
        <div className="home-grid">
          <div className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Registro de vehículos</p>
          </div>
          <div className="home-card">
            <FontAwesomeIcon icon={faWrench} size="3x" />
            <p>Visualizar estadísticas</p>
          </div>
          <div className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Visualizar Registros</p>
          </div>
          <div className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Reportar falla</p>
          </div>
          <div className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Reportes</p>
          </div>
        </div>
      </div>

      <div className="home-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => e.target.style.display = 'none'} />
      </div>
    </div>
  );
};

export default HomeSupervisor;