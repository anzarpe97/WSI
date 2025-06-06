import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faUserCircle, faSignOutAlt, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
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

  // --- Lógica de notificaciones (copiada de Home-Header) ---
  const [displayName, setDisplayName] = useState(userName);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  // Obtener notificaciones del backend
  useEffect(() => {
    if (!showIcons) return;
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
  }, [showIcons]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 541) {
        setDisplayName('Admin');
      } else {
        setDisplayName(userName ? `${userName} (Administrador)` : null);
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
  // --- Fin lógica de notificaciones ---

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
        {displayName && (
          <span className="user-name">{displayName}</span>
        )}
      </div>

      <div className="header-center">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        {showIcons && (
          <>
            {/* Notificaciones */}
            <div className="icon-wrapper" ref={notificationRef}>
              <FontAwesomeIcon
                icon={faBell}
                style={iconStyle}
                className={`header-icon ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
                title="Notificaciones"
                aria-label="Notificaciones"
                onClick={toggleNotifications}
              />
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
                    <button className="view-all">Ver todas las notificaciones</button>
                  </div>
                </div>
              )}
            </div>
            {/* Fin notificaciones */}

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