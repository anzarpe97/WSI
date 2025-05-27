import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckMoving, faUserGear } from '@fortawesome/free-solid-svg-icons';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/MenuDocumentos.css';
import { verifyToken } from '../../services/auth';

const MenuDocumentos = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "WSI - Documentos";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (!result.isValid) {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };
    check();
  }, [navigate]);

  return (
    <div className="menu-documentos-wrapper" id="menu-documentos-wrapper">
      <Header title="WSI" />
      <div className="menu-documentos-content" id="menu-documentos-content">
        <div className="menu-documentos-grid" id="menu-documentos-grid">
          <Link to="/seguros" className="menu-documentos-card" id="menu-documentos-card-seguros">
            <FontAwesomeIcon icon={faTruckMoving} size="3x" />
            <p>Registro Documento Vehiculos</p>
          </Link>
          <Link to="/registro-documentos-choferes" className="menu-documentos-card" id="menu-documentos-card-docvehiculo">
            <FontAwesomeIcon icon={faUserGear} size="3x" />
            <p>Registro Documentos Choferes</p>
          </Link>
        </div>
      </div>
      <div className="menu-documentos-bg" id="menu-documentos-bg">
        <img src={bgImage} alt="Fondo Documentos" onError={e => (e.target.style.display = 'none')} />
      </div>
    </div>
  );
};

export default MenuDocumentos;