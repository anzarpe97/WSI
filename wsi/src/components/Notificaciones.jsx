import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import '../styles/Notificaciones.css';
import bgImage from '../assets/bg-login.jpg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken } from '../services/auth';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  // Logout y temporizador de inactividad
  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  // Verificar rol del usuario al montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          if (String(result.user.rol) !== "0") {
            if (String(result.user.rol) === "1") {
              navigate('/supervisorHome', { replace: true });
            } else if (String(result.user.rol) === "2") {
              navigate('/employee-dashboard', { replace: true });
            } else {
              logout();
            }
            return;
          }
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();
  }, [navigate]);

  // Obtener notificaciones reales del backend
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    fetch('http://localhost:8000/api/notificaciones/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Ajusta según tu estructura de respuesta
        setNotificaciones(data.map(n => ({
          id: n.id,
          titulo: n.notificacion.titulo,
          mensaje: n.notificacion.mensaje,
          fecha: n.notificacion.fecha_creacion,
          leida: n.leida
        })));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Error al cargar notificaciones");
      });
  }, [navigate]);

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const marcarComoLeida = (id) => {
    fetch(`http://localhost:8000/api/notificaciones/${id}/marcar-leida/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) {
          setNotificaciones(notificaciones.map(notif =>
            notif.id === id ? { ...notif, leida: true } : notif
          ));
          toast.success("Notificación marcada como leída");
        }
      });
  };

  const eliminarNotificacion = (id) => {
    // Si tienes endpoint para eliminar, puedes usarlo aquí
    setNotificaciones(notificaciones.filter(notif => notif.id !== id));
    toast.info("Notificación eliminada");
  };

  const marcarTodasLeidas = () => {
    fetch('http://localhost:8000/api/notificaciones/marcar-todas-leidas/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) {
          setNotificaciones(notificaciones.map(notif => ({ ...notif, leida: true })));
          toast.success("Todas las notificaciones marcadas como leídas");
        }
      });
  };

  // Filtrar no leídas y las 10 últimas leídas
  const notificacionesNoLeidas = notificaciones.filter(notif => !notif.leida);
  const notificacionesLeidas = notificaciones
    .filter(notif => notif.leida)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="notificaciones-loader-container">
        <div className="notificaciones-loader"></div>
        <p>Cargando notificaciones...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="notificaciones-wrapper">
      {/* Imagen de fondo */}
      <div className="notificaciones-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />
      
      <div className="notificaciones-container">
        <div className="notificaciones-card">
          <div className="notificaciones-header">
            <div className="notificaciones-titulo-container">
              <h2 className="notificaciones-titulo">
                <FontAwesomeIcon icon={faBell} className="notificaciones-icono-titulo" />
                Notificaciones
              </h2>
              {notificacionesNoLeidas.length > 0 && (
                <span className="notificaciones-contador">{notificacionesNoLeidas.length}</span>
              )}
            </div>
            <button className="notificaciones-boton-leidas" onClick={marcarTodasLeidas}>
              Marcar todas como leídas
            </button>
          </div>
          
          {/* Sección de notificaciones no leídas */}
          {notificacionesNoLeidas.length > 0 ? (
            <div className="notificaciones-seccion">
              <h3 className="notificaciones-subtitulo">No leídas</h3>
              <div className="notificaciones-lista">
                {notificacionesNoLeidas.map(notif => (
                  <div key={notif.id} className="notificacion-item no-leida">
                    <div className="notificacion-indicador">
                      <FontAwesomeIcon icon={faCircle} className="notificacion-punto" />
                    </div>
                    <div className="notificacion-contenido">
                      <div className="notificacion-titulo">{notif.titulo}</div>
                      <div className="notificacion-mensaje">{notif.mensaje}</div>
                      <div className="notificacion-fecha">{formatFecha(notif.fecha)}</div>
                    </div>
                    <div className="notificacion-acciones">
                      <button 
                        className="notificacion-boton-accion marcar-leida" 
                        onClick={() => marcarComoLeida(notif.id)}
                        title="Marcar como leída"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="notificaciones-sin-contenido">
              <div className="notificaciones-sin-icono">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <p>No tienes notificaciones no leídas</p>
            </div>
          )}
          
          {/* Sección de notificaciones leídas (máximo 10) */}
          {notificacionesLeidas.length > 0 && (
            <div className="notificaciones-seccion">
              <h3 className="notificaciones-subtitulo">Leídas</h3>
              <div className="notificaciones-lista">
                {notificacionesLeidas.map(notif => (
                  <div key={notif.id} className="notificacion-item leida">
                    <div className="notificacion-contenido">
                      <div className="notificacion-titulo">{notif.titulo}</div>
                      <div className="notificacion-mensaje">{notif.mensaje}</div>
                      <div className="notificacion-fecha">{formatFecha(notif.fecha)}</div>
                    </div>
                    <div className="notificacion-acciones">
                      <button 
                        className="notificacion-boton-accion eliminar" 
                        onClick={() => eliminarNotificacion(notif.id)}
                        title="Eliminar notificación"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Notificaciones;