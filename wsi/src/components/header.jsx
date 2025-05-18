import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

const Header = ({ 
  title = "WSI", 
  showBackButton = true, 
  showIcons = true,
  userName = null,
  customIconSize = null
}) => {
  const navigate = useNavigate();

  // Estilo dinámico para cuando se pasa un tamaño personalizado
  const iconStyle = customIconSize ? { 
    fontSize: customIconSize,
    width: customIconSize,
    height: customIconSize
  } : {};

  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <button
            className="header-back-btn"
            onClick={() => navigate(-1)}
            title="Volver"
            aria-label="Botón de retroceso"
          >
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              style={iconStyle}
              className="header-icon"
            />
          </button>
        )}
      </div>
      
      <div className="header-center">
        <h1 className="header-title">{title}</h1>
      </div>
      
      <div className="header-right">
        {showIcons && (
          <>
            <FontAwesomeIcon 
              icon={faBell} 
              style={iconStyle}
              className="header-icon" 
              title="Notificaciones"
              aria-label="Notificaciones" 
            />
            {userName && (
              <span className="user-name">{userName}</span>
            )}
            <FontAwesomeIcon 
              icon={faUserCircle} 
              style={iconStyle}
              className="header-icon" 
              title="Perfil"
              aria-label="Perfil de usuario" 
            />
            <FontAwesomeIcon
              icon={faSignOutAlt}
              style={iconStyle}
              className="header-icon"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;