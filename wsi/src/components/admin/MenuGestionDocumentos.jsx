import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckMoving, faUserGear } from '@fortawesome/free-solid-svg-icons';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/MenuDocumentos.css';
import { verifyToken } from '../../services/auth';
import { toast } from 'react-toastify';

const MenuGestionDocumentos = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  useEffect(() => {
    document.title = "WSI - Documentos";
    const check = async () => {
      try {
        const result = await verifyToken();
        // Solo los roles 0 (admin) y 1 (supervisor) pueden entrar
        if (
          !result.isValid ||
          !result.user ||
          (String(result.user.rol) !== "0" && String(result.user.rol) !== "1")
        ) {
          logout();
        }
      } catch {
        logout();
      }
    };
    check();

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

  return (
    <div className="menu-documentos-wrapper" id="menu-documentos-wrapper">
      <Header title="WSI" />
      <div className="menu-documentos-content" id="menu-documentos-content">
        <div className="menu-documentos-grid" id="menu-documentos-grid">
          <Link to="/ver-documentos-vehiculos" className="menu-documentos-card" id="menu-documentos-card-seguros">
            <FontAwesomeIcon icon={faTruckMoving} size="3x" />
            <p>Gestión Documentos Vehículos</p>
          </Link>
          <Link to="/gestion-documento-choferes" className="menu-documentos-card" id="menu-documentos-card-docvehiculo">
            <FontAwesomeIcon icon={faUserGear} size="3x" />
            <p>Gestión Documentos Choferes</p>
          </Link>
        </div>
      </div>
      <div className="menu-documentos-bg" id="menu-documentos-bg">
        <img src={bgImage} alt="Fondo Documentos" onError={e => (e.target.style.display = 'none')} />
      </div>
    </div>
  );
};

export default MenuGestionDocumentos;