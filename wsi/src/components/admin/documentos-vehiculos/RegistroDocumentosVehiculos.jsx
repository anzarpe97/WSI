import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../styles/RegistroDocumentosVehiculos.css";
import bgImage from '../../assets/bg-login.jpg'
import Header from '../../header';
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../../services/auth";

const RegistroDocumentosVehiculos = () => {
  const [placa, setPlaca] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [placaError, setPlacaError] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [fechaError, setFechaError] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [documentosRegistrados, setDocumentosRegistrados] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  // --- Logout y temporizador de inactividad ---
  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

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
  }, [navigate]);

  document.title = "WSI - Registro Documentos Vehículos";

  const handlePlacaSearch = async () => {
    if (!placa.trim()) {
      setPlacaError('Por favor ingrese una placa');
      return;
    }

    // Limpiar y convertir a mayúsculas antes de buscar
    const placaLimpia = placa.replace(/\s+/g, '').toUpperCase();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Sesión expirada. Inicie sesión nuevamente.');
      logout();
      return;
    }

    setPlacaError('');
    setIsSearching(true);

    try {
      const response = await fetch(`http://localhost:8000/api/vehiculos/buscar/?placa=${placaLimpia}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 401) {
        toast.error('Sesión expirada. Inicie sesión nuevamente.');
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta del backend:', data);
        // Si el backend devuelve una lista, toma el primer elemento
        const vehiculo = Array.isArray(data) ? data[0] : data;
        if (vehiculo && vehiculo.id_vehiculo && vehiculo.marca && vehiculo.modelo) {
          setVehiculoInfo({
            id: vehiculo.id_vehiculo,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            año: vehiculo.anio
          });
          toast.success("Vehículo encontrado");

          // Consultar documentos ya registrados por el vehículo
          const docsResponse = await fetch(`http://localhost:8000/api/documentos-vehiculos-verificar/?vehiculo=${vehiculo.id_vehiculo}`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (docsResponse.status === 401) {
            toast.error('Sesión expirada. Inicie sesión nuevamente.');
            logout();
            return;
          }
          if (docsResponse.ok) {
            const docsData = await docsResponse.json();
            setDocumentosRegistrados(docsData.map(doc => doc.tipo_documento));
          } else {
            setDocumentosRegistrados([]);
          }
        } else {
          setVehiculoInfo(null);
          setPlacaError("La placa no ha sido registrada");
          setDocumentosRegistrados([]);
        }
      } else {
        setVehiculoInfo(null);
        setPlacaError("La placa no ha sido registrada");
        setDocumentosRegistrados([]);
      }
    } catch {
      setVehiculoInfo(null);
      setPlacaError("Error al buscar vehículo");
      setDocumentosRegistrados([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Calcula la fecha de caducidad automáticamente
  const calcularFechaCaducidad = (tipo, emision) => {
    if (!tipo || !emision) return '';
    const fecha = new Date(emision);
    let anios = 0;
    if (tipo === 'TARJETA_PROPIEDAD') anios = 10;
    if (tipo === 'SOAT') anios = 1;
    if (tipo === 'TECNOMECANICA') anios = 1;
    if (tipo === 'SEGURO') anios = 1;
    fecha.setFullYear(fecha.getFullYear() + anios);
    return fecha.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (tipoDocumento && fechaEmision) {
      const nuevaFechaCaducidad = calcularFechaCaducidad(tipoDocumento, fechaEmision);
      setFechaCaducidad(nuevaFechaCaducidad);

      if (nuevaFechaCaducidad && new Date(nuevaFechaCaducidad) < new Date()) {
        toast.error('El documento ya está vencido. Solo se deben registrar documentos vigentes.');
      }
    } else {
      setFechaCaducidad('');
    }
  }, [tipoDocumento, fechaEmision]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setFileError('Formato no válido (solo PDF/JPG/PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('El archivo no debe exceder 5MB');
      return;
    }

    setFile(file);
    setFileError('');
  };

  const limpiarTexto = (texto) => {
    return texto.replace(/[^A-Za-z0-9_]/g, ''); // permite el guion bajo
  };

  const generarSufijoAleatorio = () => {
    return Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!vehiculoInfo) {
      toast.error('Debe buscar y seleccionar un vehículo');
      return;
    }
    if (!tipoDocumento) {
      toast.error('Tipo de documento requerido');
      return;
    }
    if (!documentNumber.trim()) {
      toast.error('Número de documento requerido');
      return;
    }
    if (!fechaEmision || !fechaCaducidad) {
      toast.error('Debe seleccionar la fecha de emisión');
      return;
    }
    if (new Date(fechaCaducidad) < new Date()) {
      toast.error('No se puede registrar un documento vencido');
      return;
    }
    if (!file) {
      toast.error('Debe subir el documento digital');
      return;
    }

    const placaLimpia = limpiarTexto(placa).toUpperCase();
    const tipoDocumentoLimpio = limpiarTexto(tipoDocumento);
    const numeroDocumentoLimpio = limpiarTexto(documentNumber);
    const ext = file.name.split('.').pop();
    const sufijo = generarSufijoAleatorio();
    const newFileName = `${placaLimpia}_${tipoDocumentoLimpio}_${sufijo}.${ext}`;
    const renamedFile = new File([file], newFileName, { type: file.type });

    const formData = new FormData();
    formData.append('placa', placaLimpia);
    formData.append('vehiculo', vehiculoInfo.id);
    formData.append('marca', vehiculoInfo.marca);
    formData.append('modelo', vehiculoInfo.modelo);
    formData.append('año', vehiculoInfo.año);
    formData.append('tipo_documento', tipoDocumentoLimpio);
    formData.append('numero_documento', numeroDocumentoLimpio);
    formData.append('fecha_emision', fechaEmision);
    formData.append('fecha_caducidad', fechaCaducidad);
    formData.append('archivo', renamedFile);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Sesión expirada. Inicie sesión nuevamente.');
      logout();
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/documentos-vehiculos/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData,
      });

      if (response.status === 401) {
        toast.error('Sesión expirada. Inicie sesión nuevamente.');
        logout();
        return;
      }

      if (response.ok) {
        toast.success('Documento registrado exitosamente');
        setPlaca('');
        setVehiculoInfo(null);
        setTipoDocumento('');
        setDocumentNumber('');
        setFechaEmision('');
        setFechaCaducidad('');
        setFile(null);
        setDocumentosRegistrados([]);
        setFormSubmitted(false);
      } else {
        const errorData = await response.json();
        console.log(errorData);
        toast.error('Error al registrar el documento');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <div className="registroDocumentosVehiculos-wrapper">
      <Header title="WSI" />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="colored"
        pauseOnHover={false}
      />
      <div className="registroDocumentosVehiculos-bg">
        <img src={bgImage} alt="Fondo" />
      </div>
      <div className="registroDocumentosVehiculos-content">
        <div className="registroDocumentosVehiculos-container">
          <h1 className="registroDocumentosVehiculos-title">
            Registro de Documentos de Vehículos
          </h1>

          <form onSubmit={handleSubmit} className="registroDocumentosVehiculos-form">
            
            <section className="registroDocumentosVehiculos-section">
              <h2 className="registroDocumentosVehiculos-sectionTitle">Datos del Vehículo</h2>
              
              <div className="registroDocumentosVehiculos-field">
                <label>Placa del Vehículo</label>
                <div className="placa-search-container">
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.replace(/\s+/g, '').toUpperCase())}
                    placeholder="Ej: A17BN21"
                    className={placaError ? 'input-error' : ''}
                    aria-describedby="placa-error"
                  />
                  <button
                    type="button"
                    onClick={handlePlacaSearch}
                    className={`search-btn ${isSearching ? 'searching' : ''}`}
                    disabled={isSearching || !placa}
                  >
                    {isSearching ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faSearch} />
                    )}
                    <span>Buscar</span>
                  </button>
                </div>
                {placaError && (
                  <div id="placa-error" className="error-message">
                    {placaError}
                  </div>
                )}
              </div>

              {vehiculoInfo && (
                <div className="vehiculo-info-container">
                  <div className="vehiculo-info-details">
                    <div><strong>Vehículo:</strong> {vehiculoInfo.marca} {vehiculoInfo.modelo} ({vehiculoInfo.año})</div>
                  </div>
                </div>
              )}
            </section>

            <section className="registroDocumentosVehiculos-section">
              <h2 className="registroDocumentosVehiculos-sectionTitle">Información del Documento</h2>
              
              <div className="registroDocumentosVehiculos-field">
                <label>Tipo de Documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className={(!tipoDocumento && formSubmitted) ? 'input-error' : ''}
                  aria-required="true"
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="RCV" disabled={documentosRegistrados.includes('RCV')}>RCV</option>
                  <option value="TRIMESTRES" disabled={documentosRegistrados.includes('TRIMESTRES')}>Trimestres</option>
                </select>
                {!tipoDocumento && (
                  <div className="error-message">Campo requerido</div>
                )}
              </div>

              <div className="registroDocumentosVehiculos-field">
                <label>Número de Documento</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: TP-123456789"
                  aria-required="true"
                />
              </div>

              <div className="registroDocumentosVehiculos-row">
                <div className="registroDocumentosVehiculos-field">
                  <label>Fecha de Emisión</label>
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="registroDocumentosVehiculos-field">
                  <label>Fecha de Caducidad</label>
                  <input
                    type="date"
                    value={fechaCaducidad}
                    readOnly
                    disabled
                  />
                </div>
              </div>
              {fechaError && (
                <div className="error-message">
                  {fechaError}
                </div>
              )}
            </section>

            <section className="registroDocumentosVehiculos-section">
              <h2 className="registroDocumentosVehiculos-sectionTitle">Documento Digital</h2>
              
              <div className="registroDocumentosVehiculos-field">
                <label>Subir Documento (PDF/JPG/PNG)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={fileError ? 'input-error' : ''}
                />
                {file && (
                  <div className="file-preview">
                    {file.name}
                  </div>
                )}
                {fileError && (
                  <div className="error-message">
                    {fileError}
                  </div>
                )}
              </div>
            </section>

            <div className="registroDocumentosVehiculos-actions">
              <button 
                type="submit" 
                className="registroDocumentosVehiculos-submitBtn"
              >
                Registrar Documento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegistroDocumentosVehiculos;