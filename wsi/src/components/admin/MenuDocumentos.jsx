import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/MenuDocumentos.css';

const MenuDocumentos = () => {
    document.title = "WSI - Documentos";

  return (
    <div className="menu-documentos-wrapper" id="menu-documentos-wrapper">
      <Header title="WSI" />
      <div className="menu-documentos-content" id="menu-documentos-content">
        <div className="menu-documentos-grid" id="menu-documentos-grid">
          <Link to="/seguros" className="menu-documentos-card" id="menu-documentos-card-seguros">
            <FontAwesomeIcon icon={faFileContract} size="3x" />
            <p>Registro Documento Choferes</p>
          </Link>
          <Link to="/documentos-vehiculo" className="menu-documentos-card" id="menu-documentos-card-docvehiculo">
            <FontAwesomeIcon icon={faFileInvoice} size="3x" />
            <p>Registro Documentos Vehículo</p>
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