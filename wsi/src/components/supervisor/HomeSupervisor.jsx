import React, { useEffect, useState } from 'react';
import '../../styles/home.css';
import { useNavigate } from 'react-router-dom';
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
  faClipboard,
  faFileAlt,
  faTools,
  faUsers,
  faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import UserHeader from '../Home-Header';
import bgImage from '../../assets/bg-login.jpg';

const SupervisorHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: 'Supervisor', apellido: '' });

  return (
    <div className="home-wrapper">
      {/* Header con Home-Header */}
      <UserHeader 
        userName={user.nombre} 
        title="WSI"
        showIcons={true}
      />

      {/* Contenido principal */}
      <div className="home-content">
        <div className="home-grid">
          {/* Gestión de Vehículos */}
          <Link to="/gestion-vehiculos" className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Gestionar Vehículos</p>
          </Link>

          {/* Gestión de Mantenimiento */}
          <Link to="/gestion-mantenimiento" className="home-card">
            <FontAwesomeIcon icon={faTools} size="3x" />
            <p>Gestionar Mantenimiento</p>
          </Link>

          {/* Gestión Documentos Choferes */}
          <Link to="/gestion-documentos-choferes" className="home-card">
            <FontAwesomeIcon icon={faUsers} size="3x" />
            <p>Documentos de Choferes</p>
          </Link>

          {/* Gestión Documentos Vehículos */}
          <Link to="/gestion-documentos-vehiculos" className="home-card">
            <FontAwesomeIcon icon={faFileSignature} size="3x" />
            <p>Documentos de Vehículos</p>
          </Link>

          {/* Reportar Falla */}
          <Link to="/reportar-falla" className="home-card">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>Reportar Falla</p>
          </Link>

          {/* Generar Reporte */}
          <Link to="/generar-reporte" className="home-card">
            <FontAwesomeIcon icon={faClipboard} size="3x" />
            <p>Generar Reporte</p>
          </Link>

          {/* Visualizar Vehículos */}
          <Link to="/visualizar-vehiculos" className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Visualizar Vehículos</p>
          </Link>

          {/* Visualizar Documentos */}
          <Link to="/visualizar-documentos" className="home-card">
            <FontAwesomeIcon icon={faFileAlt} size="3x" />
            <p>Visualizar Documentos</p>
          </Link>

          {/* Visualizar Mantenimiento */}
          <Link to="/visualizar-mantenimiento" className="home-card">
            <FontAwesomeIcon icon={faWrench} size="3x" />
            <p>Visualizar Mantenimiento</p>
          </Link>

          {/* Visualizar Estadísticas */}
          <Link to="/visualizar-estadisticas" className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Visualizar Estadísticas</p>
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

export default SupervisorHome;