import '../styles/home.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUser, faWrench, faChartBar, faBell,faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../services/auth';
import { Link } from 'react-router-dom';
import bgImage from '../assets/bg-login.jpg';
import React, { useEffect, useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: '', apellido: '' });

  useEffect(() => {
    const check = async () => {
      const result = await verifyToken();
      console.log("Usuario recibido:", result.user); // ✅ DEBUG

      if (result.isValid && result.user) {
        setUser({
          nombre: result.user.nombre,
          apellido: result.user.apellido
        });
      } else {
        navigate('/login');
      }
    };

    check();
  }, [navigate]);
  return (
    <div className="home-wrapper">
      <header className="home-header">
        <div className="user-info-container">
    <p>{user.nombre}   (Admin)</p>
  </div>
        <h1>WSI</h1>

        <div className="home-header-right">
        <FontAwesomeIcon icon={faBell} size="lg" className="header-icon" title="Notificaciones" />
        <FontAwesomeIcon icon={faUserCircle} size="lg" className="header-icon" title="Perfil" />
        <FontAwesomeIcon
          icon={faSignOutAlt}
          size="lg"
          className="header-icon"
          title="Cerrar sesión"
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
        />
      </div>
      </header>

      <div className="home-content">
        <div className="home-grid">
          <Link to="/registro-documentos-vehiculo" className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Registro de vehículos</p>
          </Link>
          <Link to="/registro-empleado" className="home-card">
            <FontAwesomeIcon icon={faUser} size="3x" />
            <p>Registro de empleados</p>
          </Link>
          <Link to="/mantenimiento-vehiculos" className="home-card">
            <FontAwesomeIcon icon={faWrench} size="3x" />
            <p>Mantenimiento de vehículos</p>
          </Link>
          <Link to="/reportes" className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Reportes</p>
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
