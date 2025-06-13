import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faUserCircle, 
  faSignOutAlt,
  faCheckCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/home-header.css';

const UserHeader = ({ userName = "Usuario", title = "WSI", showIcons = true }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(userName);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);

  // Definición de estilos para el ícono de usuario
  const iconStyle = {
    fontSize: "2rem",
    color: "#222",
    cursor: "pointer",
    marginLeft: "18px"
  };

  // Obtener notificaciones del backend
  useEffect(() => {
    fetch('http://localhost:8000/api/notificaciones/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data.map(n => ({
          id: n.id,
          title: n.notificacion.titulo,
          content: n.notificacion.mensaje,
          time: new Date(n.notificacion.fecha_creacion).toLocaleString(),
          read: n.leida
        })));
      });
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 541) {
        setDisplayName('Admin');
      } else {
        setDisplayName(`${userName} (Administrador)`);
      }
    }
    
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userName]);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const markAsRead = (id) => {
    fetch(`http://localhost:8000/api/notificaciones/${id}/marcar-leida/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
    });
  };

  const markAllAsRead = () => {
    fetch('http://localhost:8000/api/notificaciones/marcar-todas-leidas/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        setNotifications([]);
      }
    });
  };

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
          <div className="icon-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
            <FontAwesomeIcon 
              icon={faBell} 
              className={`header-icon ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
              title="Notificaciones"
              aria-label="Notificaciones"
              onClick={toggleNotifications}
            />
            {notifications.some(n => !n.read) && (
              <span className="notification-badge"></span>
            )}
            {notificationsOpen && (
              <div className="notification-tray">
                <div className="notification-header">
                  <h3>Notificaciones</h3>
                  <div className="notification-actions">
                    <button onClick={markAllAsRead} className="mark-all-read">
                      Marcar todas como leídas
                    </button>
                    <button 
                      className="close-tray"
                      onClick={toggleNotifications}
                      aria-label="Cerrar bandeja de notificaciones"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                
                <div className="notification-list">
                {notifications
                  .filter(notification => !notification.read)
                  .map(notification => (
                    <div 
                      key={notification.id} 
                      className="notification-item unread"
                    >
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.content}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      <button 
                        className="mark-as-read"
                        onClick={() => markAsRead(notification.id)}
                        title="Marcar como leído"
                        aria-label="Marcar notificación como leída"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                    </div>
                ))}
              </div>
                
                <div className="notification-footer">
                  <button
                    className="view-all"
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/notificaciones');
                    }}
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="icon-wrapper">
            <FontAwesomeIcon
              icon={faUserCircle}
              style={iconStyle}
              className="header-icon"
              title="Perfil"
              aria-label="Perfil de usuario"
              onClick={() => navigate('/perfil-usuario')}
            />
          </div>
          
          <div className="icon-wrapper">
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
        </div>
      )}
    </header>
  );
};

export default UserHeader;