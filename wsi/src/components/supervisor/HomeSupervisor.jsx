import React from 'react';
import '../../styles/home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faUser, faWrench, faChartBar, faBell, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import bgImage from '../../assets/bg-login.jpg'; // Verifica que esta imagen exista

const Home = () => {
  console.log('🔸 Home renderizado');
  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1>WSI</h1>
        <div className="header-icons">
                  <FontAwesomeIcon icon={faBell} size="lg" className="header-icon" />
                  <FontAwesomeIcon icon={faUser} size="lg" className="header-icon" />
                  <FontAwesomeIcon icon={faSignOutAlt} size="lg" className="header-icon" />
                </div>
      </header>

      <div className="home-content">
        <div className="home-grid">
          <div className="home-card">
            <FontAwesomeIcon icon={faCar} size="3x" />
            <p>Registro de vehículos</p>
          </div>
      
          <div className="home-card">
            <FontAwesomeIcon icon={faWrench} size="3x" />
            <p>Vizualizar estadisticas</p>
          </div>
          <div className="home-card">
            <FontAwesomeIcon icon={faChartBar} size="3x" />
            <p>Vizualizar Registros</p>
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
        <img src={bgImage} alt="Fondo Home" onError={(e) => e.target.style.display = 'none'} />
      </div>
    </div>
  );
};

export default Home;