import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSearch, faCar, faSpinner, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../styles/DetalleMantenimiento.css";
import bgImage from '../../assets/bg-login.jpg';
import Header from '../header';
import { useNavigate, useParams } from "react-router-dom";
import { verifyToken } from "../../services/auth";

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
  
  // Estados para nuevos suministros
  const [newSupplies, setNewSupplies] = useState([{
    detalle: '',
    cantidad: '',
    precio: '',
    total: '0.00'
  }]);

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

  // Manejar cambios en nuevos suministros
  const handleNewSupplyChange = (index, field, value) => {
    const newSupplies = [...newSupplies];
    newSupplies[index][field] = value;

    if (field === 'cantidad' || field === 'precio') {
      const cantidad = parseFloat(newSupplies[index].cantidad) || 0;
      const precio = parseFloat(newSupplies[index].precio) || 0;
      newSupplies[index].total = (cantidad * precio).toFixed(2);
    }

    setNewSupplies(newSupplies);
  };

  // Agregar nuevo suministro
  const addNewSupply = () => {
    setNewSupplies([...newSupplies, {
      detalle: '',
      cantidad: '',
      precio: '',
      total: '0.00'
    }]);
  };

  // Eliminar nuevo suministro
  const removeNewSupply = (index) => {
    if (newSupplies.length > 1) {
      const newSuppliesList = newSupplies.filter((_, i) => i !== index);
      setNewSupplies(newSuppliesList);
    }
  };

  // Validar nuevos suministros
  const validateNewSupplies = () => {
    return newSupplies.every(supply => {
      return (
        supply.detalle.trim() !== '' &&
        supply.cantidad !== '' &&
        supply.precio !== ''
      );
    });
  };

  // Guardar nuevos suministros
  const saveNewSupplies = async () => {
    if (!validateNewSupplies()) {
      toast.error('Complete todos los campos de los nuevos suministros');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/mantenimientos/${id}/agregar_suministros/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          suministros: newSupplies.map(s => ({
            motivo: s.detalle,
            cantidad: s.cantidad,
            precio_und: s.precio
          }))
        })
      });

      if (response.ok) {
        toast.success('Suministros agregados correctamente');
        // Actualizar mantenimiento
        const updatedResponse = await fetch(`http://localhost:8000/api/mantenimientos/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        const updatedData = await updatedResponse.json();
        setMaintenance(updatedData);
        // Limpiar nuevos suministros
        setNewSupplies([{
          detalle: '',
          cantidad: '',
          precio: '',
          total: '0.00'
        }]);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al agregar suministros');
      }
    } catch (error) {
      toast.error('Error de conexión al agregar suministros');
    }
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

            {/* Sección de suministros existentes */}
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
                        <div className="detalle-mantenimiento-read-only">${parseFloat(suministro.precio_und).toFixed(2)}</div>
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

            {/* Sección para añadir nuevos suministros */}
            <div className="detalle-mantenimiento-section detalle-mantenimiento-new-supplies">
              <h3 className="detalle-mantenimiento-section-title">Agregar Nuevos Suministros</h3>

              <div className="detalle-mantenimiento-supplies">
                {newSupplies.map((suministro, index) => (
                  <div key={index} className="detalle-mantenimiento-supply-item">
                    <div className="detalle-mantenimiento-supply-field">
                      <label>Detalle</label>
                      <input
                        type="text"
                        value={suministro.detalle}
                        onChange={(e) => handleNewSupplyChange(index, 'detalle', e.target.value)}
                        placeholder="Descripción del material"
                        required
                      />
                    </div>

                    <div className="detalle-mantenimiento-supply-field">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={suministro.cantidad}
                        onChange={(e) => handleNewSupplyChange(index, 'cantidad', e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="detalle-mantenimiento-supply-field">
                      <label>Precio Unitario</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={suministro.precio}
                        onChange={(e) => handleNewSupplyChange(index, 'precio', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="detalle-mantenimiento-supply-field detalle-mantenimiento-total">
                      <label>Total</label>
                      <div className="detalle-mantenimiento-total-display">
                        ${suministro.total}
                      </div>
                    </div>

                    {newSupplies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNewSupply(index)}
                        className="detalle-mantenimiento-delete-btn"
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
                onClick={addNewSupply}
                className="detalle-mantenimiento-add-btn"
              >
                <FontAwesomeIcon icon={faPlus} /> Agregar Suministro
              </button>
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

            {/* Botón para guardar nuevos suministros */}
            <div className="detalle-mantenimiento-actions">
              <button
                type="button"
                onClick={saveNewSupplies}
                className="detalle-mantenimiento-save-btn"
              >
                Guardar Nuevos Suministros
              </button>
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