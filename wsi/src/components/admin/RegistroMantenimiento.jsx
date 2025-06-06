import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faCar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../styles/RegistroMantenimiento.css";
import bgImage from '../../assets/bg-login.jpg';
import Header from '../header';
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../services/auth";

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

  // Verificación de token y temporizador de inactividad
  useEffect(() => {
    document.title = "WSI - Registro Mantenimiento";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (!result.isValid) {
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
      }, 1200000); // 5 minutos = 300,000 ms
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // --- Fin temporizador ---
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
        setMecanicos(Array.isArray(data) ? data : []);
      } catch {
        setMecanicos([]);
      }
    };
    fetchMecanicos();
  }, []);

  // Validar suministros
  const validarSuministros = () => {
    return suministros.every(suministro => {
      return (
        suministro.detalle.trim() !== '' &&
        suministro.cantidad !== '' &&
        suministro.precio !== ''
      );
    });
  };

  // Manejar cambios en suministros
  const handleSuministroChange = (index, field, value) => {
    const newSuministros = [...suministros];
    newSuministros[index][field] = value;

    if (field === 'cantidad' || field === 'precio') {
      const cantidad = parseFloat(newSuministros[index].cantidad) || 0;
      const precio = parseFloat(newSuministros[index].precio) || 0;
      newSuministros[index].total = (cantidad * precio).toFixed(2);
    }

    setSuministros(newSuministros);
  };

  // Agregar nuevo suministro
  const addSuministro = () => {
    if (!validarSuministros()) {
      toast.error('Complete todos los campos del suministro actual antes de agregar uno nuevo');
      return;
    }

    setSuministros([...suministros, {
      detalle: '',
      cantidad: '',
      precio: '',
      total: '0.00'
    }]);
  };

  // Eliminar suministro
  const removeSuministro = (index) => {
    if (suministros.length > 1) {
      const newSuministros = suministros.filter((_, i) => i !== index);
      setSuministros(newSuministros);
    }
  };

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

    // Si la fecha límite es anterior a la nueva fecha de inicio, actualizarla
    if (fechaLimite && new Date(fechaLimite) < new Date(selectedDate)) {
      setFechaLimite(selectedDate);
    }
  };

  // Manejar cambio de fecha límite
  const handleFechaLimiteChange = (e) => {
    setFechaLimite(e.target.value);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehiculoInfo) {
      toast.error('Debe buscar y seleccionar un vehículo');
      return;
    }

    if (!validateDates()) {
      toast.error('Por favor corrija las fechas antes de enviar');
      return;
    }

    if (!validarSuministros()) {
      toast.error('Complete todos los campos de suministros');
      return;
    }

    if (!motivo || !tipoMantenimiento || !mecanico) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
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
          observaciones,
          suministros: suministros.map(s => ({
            motivo: s.detalle,
            cantidad: s.cantidad,
            precio_und: s.precio,
            total: (parseFloat(s.cantidad || 0) * parseFloat(s.precio || 0)).toFixed(2)
          }))
        })
      });

      if (response.ok) {
        toast.success('Orden de mantenimiento creada correctamente');
        // Opcional: limpiar formulario aquí
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al crear la orden');
      }
    } catch (error) {
      toast.error('Error de conexión al crear la orden');
    }
  };

  return (
    <div className="registroMantenimiento-wrapper">
      <Header title="WSI" />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="registroMantenimiento-content">
        <div className="registroMantenimiento-bg">
          <img
            src={bgImage}
            alt="Fondo Registro Mantenimiento"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>

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
                    <option value="1">Cambio de Aceite y Filtros</option>
                    <option value="2">Cambio de Correa del motor</option>
                    <option value="3">Cambio de Correa del compresor de aire</option>
                    <option value="4">Cambio de Correa del alternador</option>
                    <option value="5">Cambio de Correa multicanal del motor</option>
                    <option value="6">Cambio de Filtro de purificador de Aire</option>
                    <option value="7">Reemplazo o Servicio de Inyectores</option>
                    <option value="8">Reemplazo o Servicio a Bomba de Inyección</option>
                    <option value="9">Engrase de puntos de lubricación</option>
                    <option value="10">Sustitución de Bujías</option>
                    <option value="11">Cambio de Pastillas y Discos de Freno</option>
                    <option value="12">Reparación o Sustitución del Alternador</option>
                    <option value="13">Cambio de Amortiguadores</option>
                    <option value="14">Revisión o Cambio de la empacadura de la cámara de compresión</option>
                    <option value="15">Cambio del Embrague</option>
                    <option value="16">Sustitución del Termostato</option>
                    <option value="17">Cambio de Líquido de Frenos</option>
                    <option value="18">Reparación o Cambio del Turbo</option>
                    <option value="19">Cambio de Filtro de Combustible</option>
                    <option value="20">Sustitución o reparación del Sistema de Escape</option>
                    <option value="21">Reparación de la Transmisión</option>
                    <option value="22">Cambio de Neumáticos</option>
                    <option value="23">Reparación de Neumáticos</option>
                    <option value="24">Cambio del Filtro de Partículas</option>
                    <option value="25">Reparación del Sistema de Dirección</option>
                    <option value="26">Cambio de Rodamientos de artillerías</option>
                    <option value="27">Cambio de la Empacadura del Cárter</option>
                    <option value="28">Alineación del tren delantero</option>
                  </select>
                </div>
                <div className="registroMantenimiento-field">
                  <label htmlFor="registroMantenimiento-placa">Placa vehículo</label>
                  <div className="placa-search-container">
                    <input
                      type="text"
                      id="registroMantenimiento-placa"
                      maxLength='7'
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

            {/* Sección de suministros */}
            <div className="registroMantenimiento-section">
              <h3 className="registroMantenimiento-sectionTitle">Suministros</h3>

              <div className="registroMantenimiento-supplies">
                {suministros.map((suministro, index) => (
                  <div key={index} className="registroMantenimiento-supplyItem">
                    <div className="registroMantenimiento-supplyField">
                      <label>Detalle</label>
                      <input
                        type="text"
                        value={suministro.detalle}
                        onChange={(e) => handleSuministroChange(index, 'detalle', e.target.value)}
                        placeholder="Descripción del material"
                        required
                      />
                    </div>

                    <div className="registroMantenimiento-supplyField">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={suministro.cantidad}
                        onChange={(e) => handleSuministroChange(index, 'cantidad', e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="registroMantenimiento-supplyField">
                      <label>Precio Unitario</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={suministro.precio}
                        onChange={(e) => handleSuministroChange(index, 'precio', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="registroMantenimiento-supplyField registroMantenimiento-total">
                      <label>Total</label>
                      <div className="registroMantenimiento-totalDisplay">
                        ${suministro.total}
                      </div>
                    </div>

                    {suministros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSuministro(index)}
                        className="registroMantenimiento-deleteBtn"
                        title="Eliminar suministro"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSuministro}
                className="registroMantenimiento-addBtn"
              >
                + Agregar Suministro
              </button>
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
              >
                Crear Orden de Mantenimiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroMantenimiento;