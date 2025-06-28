import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faCar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../../styles/ReporteFalla.css";
import bgImage from '../../../assets/bg-login.jpg';
import Header from '../../header';
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../../services/auth";

const ReporteFallas = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  // Verificación de token e inactividad
  useEffect(() => {
    document.title = "WSI - Reporte de Fallas";
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

    // Temporizador de inactividad
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 1200000);
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  // Estados del formulario
  const [placa, setPlaca] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [placaError, setPlacaError] = useState('');
  const [fechaReporte, setFechaReporte] = useState('');
  const [motivoFalla, setMotivoFalla] = useState('');
  const [estadoVehiculo, setEstadoVehiculo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener fecha actual
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validar formato de placa
  const validarPlaca = (placa) => {
    const placaRegex = /^[A-Z0-9]{6,7}$/;
    return placaRegex.test(placa);
  };

  // Buscar vehículo por placa
  const buscarVehiculo = async () => {
    if (!placa.trim()) {
      setPlacaError('Por favor ingrese una placa');
      setVehiculoInfo(null);
      return;
    }
    if (!validarPlaca(placa)) {
      setPlacaError('Formato de placa inválido (solo letras mayúsculas y números, 6 o 7 caracteres)');
      setVehiculoInfo(null);
      return;
    }

    setPlacaError('');
    setIsSearching(true);
    setVehiculoInfo(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/vehiculos/buscar/?placa=${encodeURIComponent(placa)}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setVehiculoInfo({
          id: data.id_vehiculo,
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          año: data.año,
        });
      } else if (data.detail === "Placa no registrada") {
        toast.error("La placa no está registrada");
        setVehiculoInfo(null);
      } else {
        setPlacaError('No se encontró un vehículo con esa placa');
        setVehiculoInfo(null);
      }
    } catch (error) {
      setPlacaError('Error al buscar la placa');
      setVehiculoInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setPlaca('');
    setVehiculoInfo(null);
    setPlacaError('');
    setFechaReporte('');
    setMotivoFalla('');
    setEstadoVehiculo('');
    setObservaciones('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!vehiculoInfo) {
      toast.error('Debe buscar y seleccionar un vehículo');
      setIsSubmitting(false);
      return;
    }

    if (!motivoFalla || !estadoVehiculo) {
      toast.error('Complete todos los campos obligatorios');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/reportes-fallas/crear/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          id_vehiculo: vehiculoInfo.id,
          motivo: motivoFalla,
          estado: estadoVehiculo,
          fecha_reporte: fechaReporte || getCurrentDate(),
          observaciones
        })
      });

      if (response.ok) {
        toast.success('Reporte de falla creado correctamente');
        resetForm();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Error al crear el reporte';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Error de conexión al crear el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reporteFallas-wrapper">
      <Header title="WSI" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="reporteFallas-bg">
        <img src={bgImage} alt="Fondo" />
      </div>
      
      <div className="reporteFallas-content">
        <div className="reporteFallas-container">
          <h1 className="reporteFallas-title">Reporte de Fallas</h1>

          <form className="reporteFallas-form" onSubmit={handleSubmit}>
            {/* Sección de información general */}
            <div className="reporteFallas-section">
              <h3 className="reporteFallas-sectionTitle">Información del Vehículo</h3>

              <div className="reporteFallas-row">
                <div className="reporteFallas-field">
                  <label htmlFor="reporteFallas-placa">Placa del vehículo</label>
                  <div className="placa-search-container">
                    <input
                      type="text"
                      id="reporteFallas-placa"
                      maxLength='8'
                      placeholder="Ej: ABC1234"
                      value={placa}
                      onChange={e => setPlaca(e.target.value.toUpperCase())}
                      className={placaError ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      onClick={buscarVehiculo}
                      className={`search-btn ${isSearching ? 'searching' : ''}`}
                      disabled={isSearching}
                    >
                      <FontAwesomeIcon icon={isSearching ? faSpinner : faSearch} spin={isSearching} />
                    </button>
                  </div>
                  {placaError && <div className="error-message">{placaError}</div>}
                </div>
              </div>

              {vehiculoInfo && (
                <div className="vehicle-info-container animate__animated animate__fadeIn">
                  <div className="vehicle-info-icon">
                    <FontAwesomeIcon icon={faCar} size="2x" />
                  </div>
                  <div className="vehicle-info-details">
                    <div><strong>Placa:</strong> {vehiculoInfo.placa}</div>
                    <div><strong>Marca/Modelo:</strong> {vehiculoInfo.marca} {vehiculoInfo.modelo}</div>
                    <div><strong>Año:</strong> {vehiculoInfo.año}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección de detalles de la falla */}
            <div className="reporteFallas-section">
              <h3 className="reporteFallas-sectionTitle">Detalles de la Falla</h3>

              <div className="reporteFallas-row">
                <div className="reporteFallas-field">
                  <label htmlFor="reporteFallas-fecha">Fecha de reporte</label>
                  <input
                    type="date"
                    id="reporteFallas-fecha"
                    max={getCurrentDate()}
                    value={fechaReporte}
                    onChange={e => setFechaReporte(e.target.value)}
                  />
                </div>
                <div className="reporteFallas-field">
                  <label htmlFor="reporteFallas-estado">Estado del vehículo</label>
                  <select
                    id="reporteFallas-estado"
                    value={estadoVehiculo}
                    onChange={e => setEstadoVehiculo(e.target.value)}
                    required
                  >
                    <option value="">Seleccione estado...</option>
                    <option value="OPERATIVO">Operativo</option>
                    <option value="NO_OPERATIVO">No operativo</option>
                  </select>
                </div>
              </div>

              <div className="reporteFallas-field">
                <label htmlFor="reporteFallas-motivo">Motivo de la falla *</label>
                <textarea
                  id="reporteFallas-motivo"
                  placeholder="Describa la falla encontrada..."
                  rows="3"
                  value={motivoFalla}
                  onChange={e => setMotivoFalla(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            {/* Sección de observaciones */}
            <div className="reporteFallas-section">
              <h3 className="reporteFallas-sectionTitle">Observaciones Adicionales</h3>
              <div className="reporteFallas-field">
                <textarea
                  id="reporteFallas-observaciones"
                  placeholder="Agregue cualquier observación adicional relevante..."
                  rows="4"
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="reporteFallas-actions">
              <button
                type="button"
                className="reporteFallas-cancelBtn"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="reporteFallas-submitBtn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Enviando...
                  </>
                ) : 'Reportar Falla'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReporteFallas;