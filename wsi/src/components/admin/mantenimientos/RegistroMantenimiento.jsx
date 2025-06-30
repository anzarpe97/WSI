import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faCar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../../styles/RegistroMantenimiento.css";
import bgImage from '../../../assets/bg-login.jpg';
import Header from '../../header';
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../../services/auth";

const RegistroMantenimiento = () => {
  // --- Manejo de sesión e inactividad ---
  const navigate = useNavigate();
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
    document.title = "WSI - Registro Mantenimiento";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          // Solo los roles 0 (admin) y 1 (supervisor) pueden entrar
          if (String(result.user.rol) !== "0" && String(result.user.rol) !== "1") {
            if (String(result.user.rol) === "2") {
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
  // --- Fin manejo de sesión e inactividad ---

  // Estados para suministros
  const [suministros, setSuministros] = useState([{
    detalle: '',
    cantidad: '',
    precio: '',
    total: '0.00'
  }]);

  // Estados para información del vehículo
  const [placa, setPlaca] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [placaError, setPlacaError] = useState('');

  // Estado para kilometraje
  const [kilometraje, setKilometraje] = useState('');
  const [kilometrajeError, setKilometrajeError] = useState('');

  // Estados para fechas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [fechaError, setFechaError] = useState('');

  const [motivo, setMotivo] = useState('');
  const [tipoMantenimiento, setTipoMantenimiento] = useState('');
  const [mecanico, setMecanico] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estado para mecánicos
  const [mecanicos, setMecanicos] = useState([]);

  // Estado para motivos de mantenimiento
  const [motivos, setMotivos] = useState([]);

  // Estado para controlar el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener motivos de mantenimiento desde la API
  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/motivos/', {
          headers: { Authorization: `Token ${token}` }
        });
        const data = await response.json();
        setMotivos(Array.isArray(data) ? data : []);
      } catch {
        setMotivos([]);
      }
    };
    fetchMotivos();
  }, []);

  // Obtener fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validar formato de placa (solo mayúsculas y números, 6 o 7 caracteres)
  const validarPlaca = (placa) => {
    const placaRegex = /^[A-Z0-9]{6,7}$/;
    return placaRegex.test(placa);
  };

  // Buscar vehículo en la base de datos
  const buscarVehiculo = async () => {
    if (!placa.trim()) {
      setPlacaError('Por favor ingrese una placa');
      setVehiculoInfo(null);
      setKilometraje('');
      return;
    }
    if (!validarPlaca(placa)) {
      setPlacaError('Formato de placa inválido (solo letras mayúsculas y números, 6 o 7 caracteres)');
      setVehiculoInfo(null);
      setKilometraje('');
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
          kilometraje: data.kilometraje
        });
        setKilometraje(data.kilometraje ? String(data.kilometraje) : '');
        setKilometrajeError('');
      } else if (data.detail === "Placa no registrada") {
        toast.error("La placa no está registrada");
        setVehiculoInfo(null);
        setKilometraje('');
      } else {
        setPlacaError('No se encontró un vehículo con esa placa');
        setVehiculoInfo(null);
        setKilometraje('');
      }
    } catch (error) {
      setPlacaError('Error al buscar la placa');
      setVehiculoInfo(null);
      setKilometraje('');
    } finally {
      setIsSearching(false);
    }
  };

  // Obtener mecánicos (usuarios con rol = 2)
  useEffect(() => {
    const fetchMecanicos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          "http://localhost:8000/api/usuarios/?rol=2",
          { headers: { Authorization: `Token ${token}` } }
        );
        const data = await response.json();
        setMecanicos(Array.isArray(data) ? data.filter(user => String(user.rol) === "2") : []);
      } catch {
        setMecanicos([]);
      }
    };
    fetchMecanicos();
  }, []);

  // Validar fechas
  const validateDates = () => {
    if (fechaInicio && fechaLimite) {
      if (new Date(fechaLimite) < new Date(fechaInicio)) {
        setFechaError('La fecha límite debe ser posterior a la fecha de inicio');
        return false;
      }
      setFechaError('');
      return true;
    }
    return false;
  };

  useEffect(() => {
    validateDates();
  }, [fechaInicio, fechaLimite]);

  // Manejar cambio de fecha inicio
  const handleFechaInicioChange = (e) => {
    const selectedDate = e.target.value;
    setFechaInicio(selectedDate);

    if (fechaLimite && new Date(fechaLimite) < new Date(selectedDate)) {
      setFechaLimite(selectedDate);
    }
  };

  // Manejar cambio de fecha límite
  const handleFechaLimiteChange = (e) => {
    setFechaLimite(e.target.value);
  };

  // Validar kilometraje antes de enviar
  const validarKilometraje = () => {
    if (!kilometraje) {
      setKilometrajeError('Ingrese el kilometraje');
      return false;
    }
    if (!/^\d+$/.test(kilometraje)) {
      setKilometrajeError('Solo se permiten números');
      return false;
    }
    if (vehiculoInfo && Number(kilometraje) < Number(vehiculoInfo.kilometraje)) {
      setKilometrajeError(`El kilometraje no puede ser menor al actual (${vehiculoInfo.kilometraje})`);
      return false;
    }
    setKilometrajeError('');
    return true;
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setPlaca('');
    setVehiculoInfo(null);
    setPlacaError('');
    setFechaInicio('');
    setFechaLimite('');
    setFechaError('');
    setMotivo('');
    setTipoMantenimiento('');
    setMecanico('');
    setObservaciones('');
    setSuministros([{ detalle: '', cantidad: '', precio: '', total: '0.00' }]);
    setKilometraje('');
    setKilometrajeError('');
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

    if (!validateDates()) {
      toast.error('Por favor corrija las fechas antes de enviar');
      setIsSubmitting(false);
      return;
    }

    if (!motivo || !tipoMantenimiento || !mecanico) {
      toast.error('Complete todos los campos obligatorios');
      setIsSubmitting(false);
      return;
    }

    if (!validarKilometraje()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 1. Registrar el mantenimiento
      const response = await fetch('http://localhost:8000/api/mantenimientos/crear/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          id_vehiculo: vehiculoInfo.id,
          id_mecanico: mecanico,
          id_motivo: motivo,
          fecha_programada: fechaInicio,
          fecha_finalizado: fechaLimite || null,
          tipo_mantenimiento: tipoMantenimiento,
          estado: "ACTIVO",
          observaciones
        })
      });

      if (response.ok) {
        // 2. Actualizar el kilometraje del vehículo
        const updateResponse = await fetch(`http://localhost:8000/api/vehiculos/${vehiculoInfo.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({ kilometraje: Number(kilometraje) })
        });

        if (!updateResponse.ok) {
          toast.warn('Mantenimiento registrado, pero no se pudo actualizar el kilometraje');
        } else {
          toast.success('Orden de mantenimiento creada y kilometraje actualizado');
        }
        resetForm();
      } else {
        let errorMessage = 'Error al crear la orden. Intente nuevamente.';
        try {
          const backendErrors = await response.json();
          if (typeof backendErrors === 'string') {
            errorMessage = backendErrors;
          } else if (typeof backendErrors === 'object' && backendErrors !== null) {
            if (backendErrors.detail) {
              errorMessage = backendErrors.detail;
            } else if (backendErrors.error) {
              errorMessage = backendErrors.error;
            } else {
              const firstErrorKey = Object.keys(backendErrors)[0];
              if (firstErrorKey && Array.isArray(backendErrors[firstErrorKey]) && backendErrors[firstErrorKey].length > 0) {
                errorMessage = `${firstErrorKey.replace(/^id_|_id$/, '').replace(/_/g, ' ')}: ${backendErrors[firstErrorKey][0]}`;
              } else if (firstErrorKey && typeof backendErrors[firstErrorKey] === 'string') {
                errorMessage = `${firstErrorKey.replace(/^id_|_id$/, '').replace(/_/g, ' ')}: ${backendErrors[firstErrorKey]}`;
              } else if (Object.values(backendErrors).length > 0 && typeof Object.values(backendErrors)[0] === 'string') {
                errorMessage = Object.values(backendErrors)[0];
              }
            }
          }
        } catch (jsonError) {
          errorMessage = `Error del servidor (estado: ${response.status}). No se pudo procesar la respuesta.`;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Error de conexión al crear la orden. Verifique su red e intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registroMantenimiento-wrapper">
      <Header title="WSI" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="registroMantenimiento-bg">
        <img src={bgImage} alt="Fondo" />
      </div>
      
      <div className="registroMantenimiento-content">
        <div className="registroMantenimiento-container">
          <h1 className="registroMantenimiento-title">Registro Orden de Mantenimiento</h1>

          <form className="registroMantenimiento-form" onSubmit={handleSubmit}>
            {/* Sección de información general */}
            <div className="registroMantenimiento-section">
              <h3 className="registroMantenimiento-sectionTitle">Información General</h3>

              <div className="registroMantenimiento-row">
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-motivo">Motivo Mantenimiento</label>
                  <select
                    id="registroMantenimiento-motivo"
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    required
                    style={{ maxWidth: '320px', width: '100%' }}
                  >
                    <option value="">Seleccione motivo...</option>
                    {motivos.map(m => (
                      <option key={m.id_motivo} value={m.id_motivo}>
                        {m.motivo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-placa">Placa vehículo</label>
                  <div className="placa-search-container">
                    <input
                      type="text"
                      id="registroMantenimiento-placa"
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
                    <div><strong>Marca:</strong> {vehiculoInfo.marca}</div>
                    <div><strong>Modelo:</strong> {vehiculoInfo.modelo}</div>
                    <div><strong>Kilometraje actual:</strong> {vehiculoInfo.kilometraje}</div>
                  </div>
                </div>
              )}

              {/* Input de kilometraje */}
              {vehiculoInfo && (
                <div className="registroMantenimiento-row">
                  <div className="registroMantenimiento-field">
                    <label htmlFor="registroMantenimiento-kilometraje">Kilometraje actual</label>
                    <input
                      type="text"
                      id="registroMantenimiento-kilometraje"
                      value={kilometraje}
                      onChange={e => {
                        // Solo permitir números
                        const val = e.target.value.replace(/\D/g, '');
                        setKilometraje(val);
                        setKilometrajeError('');
                      }}
                      min={vehiculoInfo.kilometraje || 0}
                      placeholder="Ingrese el kilometraje actual"
                      required
                    />
                    {kilometrajeError && <div className="error-message">{kilometrajeError}</div>}
                  </div>
                </div>
              )}

              <div className="registroMantenimiento-row">
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-fechaInicio">Fecha inicio</label>
                  <input
                    type="date"
                    id="registroMantenimiento-fechaInicio"
                    min={getCurrentDate()}
                    value={fechaInicio}
                    onChange={handleFechaInicioChange}
                    required
                    className={fechaError.includes('inicio') ? 'input-error' : ''}
                  />
                </div>
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-fechaLimite">Fecha límite</label>
                  <input
                    type="date"
                    id="registroMantenimiento-fechaLimite"
                    min={fechaInicio || getCurrentDate()}
                    value={fechaLimite}
                    onChange={handleFechaLimiteChange}
                    required
                    className={fechaError.includes('límite') ? 'input-error' : ''}
                  />
                </div>
              </div>
              {fechaError && <div className="error-message date-error">{fechaError}</div>}

              <div className="registroMantenimiento-row">
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-mecanico">Mecánico Encargado</label>
                  <select
                    id="registroMantenimiento-mecanico"
                    value={mecanico}
                    onChange={e => setMecanico(e.target.value)}
                    required
                  >
                    <option value="">Seleccione mecánico...</option>
                    {mecanicos.map(mec => (
                      <option key={mec.id} value={mec.id}>
                        {mec.nombre} {mec.apellido}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-tipo">Tipo de Mantenimiento</label>
                  <select
                    id="registroMantenimiento-tipo"
                    value={tipoMantenimiento}
                    onChange={e => setTipoMantenimiento(e.target.value)}
                    required
                  >
                    <option value="">Seleccione tipo...</option>
                    <option value="PREVENTIVO">Preventivo</option>
                    <option value="CORRECTIVO">Correctivo</option>
                    <option value="PREDICTIVO">Predictivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección de observaciones */}
            <div className="registroMantenimiento-section">
              <h3 className="registroMantenimiento-sectionTitle">Observaciones</h3>
              <div className="registroMantenimiento-field">
                <textarea
                  id="registroMantenimiento-observaciones"
                  placeholder="Escriba aquí cualquier observación adicional..."
                  rows="4"
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="registroMantenimiento-actions">
              <button
                type="submit"
                className="registroMantenimiento-submitBtn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando Orden...' : 'Crear Orden de Mantenimiento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroMantenimiento;