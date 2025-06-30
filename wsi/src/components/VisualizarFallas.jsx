import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faTrashAlt, faCar, faUser, faCalendarAlt, faExclamationTriangle, faClipboard, faPlus } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import bgImage from '../assets/bg-login.jpg';
import { ToastContainer, toast } from 'react-toastify';
import "../styles/VerFalla.css";
import { verifyToken } from "../services/auth";

const VisualizarFallas = () => {
  const [fallas, setFallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar token y rol del usuario
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          // Permitir acceso a roles 0, 1 y 2
          const rol = String(result.user.rol);
          if (rol !== "0" && rol !== "1" && rol !== "2") {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();
    // eslint-disable-next-line
  }, [navigate]);

  // Obtener datos de las fallas desde el backend
  useEffect(() => {
    const fetchFallas = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/reportes-fallas/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFallas(data);
        } else {
          toast.error('No se pudieron cargar los reportes de fallas');
          setFallas([]);
        }
      } catch (error) {
        toast.error('Error de conexión al cargar las fallas');
        setFallas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFallas();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const handleAtendido = async (id) => {
    // Actualizar el estado a 'Atendido' en el backend (opcional)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/reportes-fallas/${id}/marcar-atendido/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'Atendido' })
      });
      if (response.ok) {
        setFallas(fallas.map(falla =>
          falla.id_reporte === id ? { ...falla, estado: 'Atendido' } : falla
        ));
        toast.success('Reporte marcado como atendido');
      } else {
        toast.error('No se pudo marcar como atendido');
      }
    } catch (error) {
      toast.error('Error de conexión al actualizar el estado');
    }
  };

  const handleEliminar = async (id) => {
    // Eliminar el reporte en el backend (opcional)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/reportes-fallas/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok || response.status === 204) {
        setFallas(fallas.filter(falla => falla.id_reporte !== id));
        toast.info('Reporte eliminado');
      } else {
        toast.error('No se pudo eliminar el reporte');
      }
    } catch (error) {
      toast.error('Error de conexión al eliminar el reporte');
    }
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Operativo': return 'estado-operativo';
      case 'Inoperativo': return 'estado-inoperativo';
      case 'En revisión': return 'estado-revision';
      case 'Atendido': return 'estado-atendido';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="fallas-loader-container">
        <div className="fallas-loader"></div>
        <p>Cargando reportes...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="fallas-home-wrapper">
      {/* Imagen de fondo */}
      <div className="fallas-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />

      <div className="fallas-container">
        <div className="fallas-card">
          <div className="fallas-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="fallas-titulo">Reportes de Fallas</h2>
            <button
              className="fallas-boton-volver"
              style={{
                background: '#ff6a00',
                color: '#fff',
                border: '1px solid #ff6a00',
                fontWeight: 600,
                borderRadius: 8,
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/reportar-falla')}
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
              Registrar Falla
            </button>
          </div>

          <div className="fallas-list">
            {fallas.length === 0 ? (
              <p className="fallas-sin-datos">No hay reportes de fallas registrados.</p>
            ) : (
              fallas.map(falla => (
                <div key={falla.id_reporte} className="falla-item">
                  <div className="falla-header">
                    <span className="falla-id">Reporte #{falla.id_reporte}</span>
                    <span className={`falla-estado ${getEstadoClass(falla.estado)}`}>
                      {falla.estado}
                    </span>
                  </div>

                  <div className="falla-content">
                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faCar} className="falla-icon" />
                      <span className="falla-label">Vehículo:</span>
                      <span className="falla-value">{falla.id_vehiculo?.placa}</span>
                    </div>

                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faUser} className="falla-icon" />
                      <span className="falla-label">Reportado por:</span>
                      <span className="falla-value">{falla.id_usuario?.nombre}</span>
                    </div>

                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faCalendarAlt} className="falla-icon" />
                      <span className="falla-label">Fecha de reporte:</span>
                      <span className="falla-value">{formatFecha(falla.fecha_reporte)}</span>
                    </div>

                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="falla-icon" />
                      <span className="falla-label">Motivo:</span>
                      <span className="falla-value">{falla.motivo_falla}</span>
                    </div>

                    {falla.observaciones && (
                      <div className="falla-info-row">
                        <FontAwesomeIcon icon={faClipboard} className="falla-icon" />
                        <span className="falla-label">Observaciones:</span>
                        <span className="falla-value">{falla.observaciones}</span>
                      </div>
                    )}
                  </div>

                  <div className="falla-actions">
                    <button
                      className="falla-btn-atendido"
                      onClick={() => handleAtendido(falla.id_reporte)}
                      disabled={falla.estado === 'Atendido'}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      {falla.estado === 'Atendido' ? 'Atendido' : 'Marcar como atendido'}
                    </button>
                    <button
                      className="falla-btn-eliminar"
                      onClick={() => handleEliminar(falla.id_reporte)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default VisualizarFallas;