import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

const UserHeader = ({ userName = "Usuario", title = "WSI", showIcons = true }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 541) {
        setDisplayName('Admin');
      } else {
        setDisplayName(`${userName} (Administrador)`);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userName]);

  return (
    <header className="header">
      <div className="header-left">
        <span className="user-name">{displayName}</span>
      </div>
      
      <div className="header-center">
        <h1 className="header-title">{title}</h1>
      </div>
      
      {showIcons && (
        <div className="header-right">
          <FontAwesomeIcon 
            icon={faBell} 
            className="header-icon" 
            title="Notificaciones"
            aria-label="Notificaciones" 
          />
          <FontAwesomeIcon 
            icon={faUserCircle} 
            className="header-icon" 
            title="Perfil"
            aria-label="Perfil de usuario" 
          />
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="header-icon"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
          />
        </div>
      )}
    </header>
  );
};

export default UserHeader;