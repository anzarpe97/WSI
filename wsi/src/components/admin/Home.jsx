import '../../styles/home.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUser, faWrench, faChartBar, faIdCard, faCarBurst, faPeopleGroup, faScrewdriverWrench, faFileContract, faCog,  } from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../../services/auth';
import { Link } from 'react-router-dom';
import UserHeader from '../Home-Header';
import bgImage from '../../assets/bg-login.jpg';
import React, { useEffect, useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: '', apellido: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "WSI - Home";
    const check = async () => {
      try {
        const result = await verifyToken();
        //console.log("Usuario recibido:", result.user);

        if (result.isValid && result.user) {
          setUser({
            nombre: result.user.nombre,
            apellido: result.user.apellido
          });
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    check();
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
      <UserHeader 
      userName={`${user.nombre}`} 
      title="WSI"
      showIcons={true}
    />

      <div className="home-content">
  <div className="home-grid">
    {/* Cards originales */}
    <Link to="/registro-vehiculo" className="home-card">
      <FontAwesomeIcon icon={faCar} size="3x" />
      <p>Registro de vehículos</p>
    </Link>
    <Link to="/registro-empleado" className="home-card">
      <FontAwesomeIcon icon={faUser} size="3x" />
      <p>Registro de empleados</p>
    </Link>
    <Link to="/registro-mantenimiento" className="home-card">
      <FontAwesomeIcon icon={faWrench} size="3x" />
      <p>Registro de Mantenimientos</p>
    </Link>
    <Link to="/menu-documentos" className="home-card">
      <FontAwesomeIcon icon={faIdCard} size="3x" />
      <p>Gestión de conductores</p>
    </Link>
    
    {/* 6 nuevas cards */}
    
    <Link to="/reportes" className="home-card">
      <FontAwesomeIcon icon={faChartBar} size="3x" />
      <p>Reportes</p>
    </Link>

    <Link to="/ver-vehiculos" className="home-card">
    <FontAwesomeIcon icon={faCarBurst} size="3x" />
      <p>Gestión de Vehiculos</p>
    </Link>
    <Link to="/gestion-empleados" className="home-card">
      <FontAwesomeIcon icon={faPeopleGroup} size="3x" />
      <p>Gestión de Empleados</p>
    </Link>
    <Link to="/gestion-mantenimiento" className="home-card">
      <FontAwesomeIcon icon={faScrewdriverWrench} size = "3x"/>
      <p>Gestión Mantenimiento</p>
    </Link>
    <Link to="/seguros" className="home-card" disabled>
      <FontAwesomeIcon icon={faFileContract} size="3x" />
      <p>Gestión de seguros</p>
    </Link>
    <Link to="/configuracion" className="home-card">
      <FontAwesomeIcon icon={faCog} size="3x" />
      <p>Configuración del sistema</p>
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