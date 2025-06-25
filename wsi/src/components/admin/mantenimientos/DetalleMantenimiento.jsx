import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../../styles/DetalleMantenimiento.css";
import bgImage from '../../../assets/bg-login.jpg';
import Header from '../../header';
import { useNavigate, useParams } from "react-router-dom";
import { verifyToken } from "../../../services/auth";

const DetalleMantenimiento = () => {
  // --- Manejo de sesión e inactividad ---
  const navigate = useNavigate();
  const { id } = useParams();
  const inactivityTimer = useRef(null);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  // Verificación de token, rol y temporizador de inactividad
  useEffect(() => {
    document.title = "WSI - Detalle Mantenimiento";
    const check = async () => {
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
    check();

    // --- Temporizador de inactividad ---
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 1200000); // 20 minutos
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // eslint-disable-next-line
  }, [navigate]);

  // Estado para mantenimiento
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos del mantenimiento
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/detalle-mantenimiento/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });

        if (!response.ok) {
          throw new Error('Error al obtener el mantenimiento');
        }

        const data = await response.json();
        setMaintenance(data);
        setLoading(false);
      } catch (error) {
        toast.error(error.message || 'Error al cargar el mantenimiento');
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [id]);

  // Formatear fechas para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="detalle-mantenimiento-wrapper">
        <Header title="WSI" />
        <div className="detalle-mantenimiento-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Cargando detalle de mantenimiento...</p>
        </div>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="detalle-mantenimiento-wrapper">
        <Header title="WSI" />
        <div className="detalle-mantenimiento-error">
          <p>No se pudo cargar el mantenimiento solicitado</p>
          <button className="detalle-mantenimiento-back-button" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-mantenimiento-wrapper">
      <Header title="WSI" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="detalle-mantenimiento-bg">
        <img
          src={bgImage}
          alt="Fondo Detalle Mantenimiento"
          onError={(e) => (e.target.style.display = 'none')}
        />
      </div>

      <div className="detalle-mantenimiento-content">
        <div className="detalle-mantenimiento-container">
          <div className="detalle-mantenimiento-header">
            <h1 className="detalle-mantenimiento-title">Detalle de Mantenimiento</h1>
          </div>

          <div className="detalle-mantenimiento-form">
            {/* Sección de información general */}
            <div className="detalle-mantenimiento-section">
              <h3 className="detalle-mantenimiento-section-title">Información General</h3>

              <div className="detalle-mantenimiento-row">
                <div className="detalle-mantenimiento-field">
                  <label>Número de Orden</label>
                  <div className="detalle-mantenimiento-read-only">{maintenance.id_mantenimiento}</div>
                </div>
                <div className="detalle-mantenimiento-field">
                  <label>Estado</label>
                  <div className={`detalle-mantenimiento-status detalle-mantenimiento-status-${maintenance.estado.toLowerCase()}`}>
                    {maintenance.estado}
                  </div>
                </div>
              </div>

              <div className="detalle-mantenimiento-row">
                <div className="detalle-mantenimiento-field">
                  <label>Motivo Mantenimiento</label>
                  <div className="detalle-mantenimiento-read-only">{maintenance.motivo}</div>
                </div>
                <div className="detalle-mantenimiento-field">
                  <label>Placa vehículo</label>
                  <div className="detalle-mantenimiento-read-only">{maintenance.vehiculo.placa}</div>
                </div>
              </div>

              <div className="detalle-mantenimiento-vehicle-info">
                <div className="detalle-mantenimiento-vehicle-icon">
                  <FontAwesomeIcon icon={faCar} size="2x" />
                </div>
                <div className="detalle-mantenimiento-vehicle-details">
                  <div><strong>Marca:</strong> {maintenance.vehiculo.marca}</div>
                  <div><strong>Modelo:</strong> {maintenance.vehiculo.modelo}</div>
                  <div><strong>Año:</strong> {maintenance.vehiculo.anio}</div>
                </div>
              </div>

              <div className="detalle-mantenimiento-row">
                <div className="detalle-mantenimiento-field">
                  <label>Fecha de inicio</label>
                  <div className="detalle-mantenimiento-read-only">{formatDate(maintenance.fecha_programada)}</div>
                </div>
                <div className="detalle-mantenimiento-field">
                  <label>Fecha de finalización</label>
                  <div className="detalle-mantenimiento-read-only">{formatDate(maintenance.fecha_finalizado)}</div>
                </div>
              </div>

              <div className="detalle-mantenimiento-row">
                <div className="detalle-mantenimiento-field">
                  <label>Mecánico Encargado</label>
                  <div className="detalle-mantenimiento-read-only">
                    {maintenance.mecanico.nombre} {maintenance.mecanico.apellido}
                  </div>
                </div>
                <div className="detalle-mantenimiento-field">
                  <label>Tipo de Mantenimiento</label>
                  <div className="detalle-mantenimiento-read-only">{maintenance.tipo_mantenimiento}</div>
                </div>
              </div>
            </div>

            {/* Sección de suministros solo lectura */}
            <div className="detalle-mantenimiento-section">
              <h3 className="detalle-mantenimiento-section-title">Suministros</h3>
              {maintenance.suministros && maintenance.suministros.length > 0 ? (
                <div className="detalle-mantenimiento-supplies">
                  {maintenance.suministros.map((suministro, index) => (
                    <div key={index} className="detalle-mantenimiento-supply-item detalle-mantenimiento-supply-item-readonly">
                      <div className="detalle-mantenimiento-supply-field">
                        <label>Detalle</label>
                        <div className="detalle-mantenimiento-read-only">{suministro.motivo}</div>
                      </div>
                      <div className="detalle-mantenimiento-supply-field">
                        <label>Cantidad</label>
                        <div className="detalle-mantenimiento-read-only">{suministro.cantidad}</div>
                      </div>
                      <div className="detalle-mantenimiento-supply-field">
                        <label>Precio Unitario</label>
                        <div className="detalle-mantenimiento-read-only">
                          ${parseFloat(suministro.precio_und).toFixed(2)}
                        </div>
                      </div>
                      <div className="detalle-mantenimiento-supply-field detalle-mantenimiento-total">
                        <label>Total</label>
                        <div className="detalle-mantenimiento-total-display">
                          ${parseFloat(suministro.total).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="detalle-mantenimiento-no-supplies">
                  No se han registrado suministros para este mantenimiento.
                </div>
              )}
            </div>

            {/* Sección de observaciones */}
            <div className="detalle-mantenimiento-section">
              <h3 className="detalle-mantenimiento-section-title">Observaciones</h3>
              <div className="detalle-mantenimiento-field">
                <div className="detalle-mantenimiento-observations">
                  {maintenance.observaciones || "No se han registrado observaciones."}
                </div>
              </div>
            </div>

            {/* Botón para volver */}
            <div className="detalle-mantenimiento-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="detalle-mantenimiento-back-button"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleMantenimiento;