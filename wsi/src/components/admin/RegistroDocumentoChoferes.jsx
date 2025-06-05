import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../styles/RegistroDocumentoChoferes.css";
import bgImage from '../../assets/bg-login.jpg'
import Header from '../header';
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../services/auth";

const RegistroDocumentoChoferes = () => {
  const [cedula, setCedula] = useState('');
  const [choferInfo, setChoferInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [cedulaError, setCedulaError] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [fechaError, setFechaError] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [documentosRegistrados, setDocumentosRegistrados] = useState([]);
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
        if (!(result.isValid && result.user)) {
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();

    // --- Temporizador de inactividad ---
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 300000); // 5 minutos = 300,000 ms
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // --- Fin temporizador ---
  }, [navigate]);
  // --- Fin Logout y temporizador ---

  const validarCedula = (cedula) => /^\d{7,8}$/.test(cedula);

  document.title = "WSI - Registro Documentos Choferes";

  const handleCedulaSearch = async () => {
    if (!cedula.trim()) {
      setCedulaError('Por favor ingrese una cédula');
      return;
    }
    if (!validarCedula(cedula)) {
      setCedulaError('Formato inválido (debe contener entre 7 - 8 dígitos numéricos)');
      return;
    }

    setCedulaError('');
    setIsSearching(true);

    try {
      const response = await fetch(`http://localhost:8000/api/choferes/?cedula=${cedula}&rol=2`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.id && data.nombre && data.apellido) {
          setChoferInfo({
            id: data.id,
            nombre: data.nombre,
            apellido: data.apellido
          });
          toast.success("Chofer encontrado");

          // Consultar documentos ya registrados por el chofer
          const docsResponse = await fetch(`http://localhost:8000/api/documentos-choferes-verificar/?chofer=${data.id}`);
          if (docsResponse.ok) {
            const docsData = await docsResponse.json();
            setDocumentosRegistrados(docsData.map(doc => doc.tipo_documento));
          } else {
            setDocumentosRegistrados([]);
          }
        } else {
          setChoferInfo(null);
          setCedulaError("El número de cédula no ha sido registrado");
          setDocumentosRegistrados([]);
        }
      } else {
        setChoferInfo(null);
        setCedulaError("El número de cédula no ha sido registrado");
        setDocumentosRegistrados([]);
      }
    } catch {
      setChoferInfo(null);
      setCedulaError("Error al buscar chofer");
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
    if (tipo === 'CEDULA_IDENTIDAD') anios = 10;
    if (tipo === 'LICENCIA_CONDUCIR') anios = 5;
    if (tipo === 'CARTA_MEDICA') anios = 5;
    fecha.setFullYear(fecha.getFullYear() + anios);
    return fecha.toISOString().split('T')[0];
  };

  // Actualiza la fecha de caducidad automáticamente y valida vigencia
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!choferInfo) {
      toast.error('Debe buscar y seleccionar un chofer');
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

    // Limpiar caracteres especiales
    const cedulaLimpia = limpiarTexto(cedula);
    const tipoDocumentoLimpio = limpiarTexto(tipoDocumento);
    const numeroDocumentoLimpio = limpiarTexto(documentNumber);

    // Cambiar el nombre del archivo antes de enviarlo
    const ext = file.name.split('.').pop();
    const newFileName = `${cedulaLimpia}_${tipoDocumentoLimpio}.${ext}`;
    const renamedFile = new File([file], newFileName, { type: file.type });

    const formData = new FormData();
    formData.append('cedula', cedulaLimpia);
    formData.append('chofer', choferInfo.id);
    formData.append('nombre', choferInfo.nombre);
    formData.append('apellido', choferInfo.apellido);
    formData.append('tipo_documento', tipoDocumentoLimpio);
    formData.append('numero_documento', numeroDocumentoLimpio);
    formData.append('fecha_emision', fechaEmision);
    formData.append('fecha_caducidad', fechaCaducidad);
    formData.append('archivo', renamedFile);

    try {
      const response = await fetch('http://localhost:8000/api/documentos-choferes/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Documento registrado exitosamente');
        setCedula('');
        setChoferInfo(null);
        setTipoDocumento('');
        setDocumentNumber('');
        setFechaEmision('');
        setFechaCaducidad('');
        setFile(null);
        setDocumentosRegistrados([]);
      } else {
        const errorData = await response.json();
        console.log(errorData); // Aquí verás el detalle del error
        toast.error('Error al registrar el documento');
      }
    } catch (error) {
      console.log(error); // Aquí verás el detalle del error de red
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <div className="registroDocumentoChoferes-wrapper">
      <Header title="WSI" />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="colored"
        pauseOnHover={false}
      />

      <div className="registroDocumentoChoferes-content">
        <div className="registroDocumentoChoferes-bg">
          <img src={bgImage} alt="Fondo Documentos" />
        </div>

        <div className="registroDocumentoChoferes-container">
          <h1 className="registroDocumentoChoferes-title">
            Registro de Documentos de Choferes
          </h1>

          <form onSubmit={handleSubmit} className="registroDocumentoChoferes-form">
            
            <section className="registroDocumentoChoferes-section">
              <h2 className="registroDocumentoChoferes-sectionTitle">Datos del Chofer</h2>
              
              <div className="registroDocumentoChoferes-field">
                <label>Cédula del Chofer</label>
                <div className="cedula-search-container">
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej: 12345678"
                    className={cedulaError ? 'input-error' : ''}
                    aria-describedby="cedula-error"
                  />
                  <button
                    type="button"
                    onClick={handleCedulaSearch}
                    className={`search-btn ${isSearching ? 'searching' : ''}`}
                    disabled={isSearching || !cedula}
                  >
                    {isSearching ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faSearch} />
                    )}
                    <span>Buscar</span>
                  </button>
                </div>
                {cedulaError && (
                  <div id="cedula-error" className="error-message">
                    {cedulaError}
                  </div>
                )}
              </div>

              {choferInfo && (
                <div className="chofer-info-container">
                  <div className="chofer-info-details">
                    <div><strong>Nombre:</strong> {choferInfo.nombre} {choferInfo.apellido}</div>
                  </div>
                </div>
              )}
            </section>

            <section className="registroDocumentoChoferes-section">
              <h2 className="registroDocumentoChoferes-sectionTitle">Información del Documento</h2>
              
              <div className="registroDocumentoChoferes-field">
                <label>Tipo de Documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className={!tipoDocumento ? 'input-error' : ''}
                  aria-required="true"
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="CEDULA_IDENTIDAD" disabled={documentosRegistrados.includes('CEDULA_IDENTIDAD')}>Cedula de Identidad</option>
                  <option value="LICENCIA_CONDUCIR" disabled={documentosRegistrados.includes('LICENCIA_CONDUCIR')}>Licencia De Conducir</option>
                  <option value="CARTA_MEDICA" disabled={documentosRegistrados.includes('CARTA_MEDICA')}>Carta Medica</option>
                </select>
                {!tipoDocumento && (
                  <div className="error-message">Campo requerido</div>
                )}
              </div>

              <div className="registroDocumentoChoferes-field">
                <label>Número de Documento</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: ABC-123456"
                  aria-required="true"
                />
              </div>

              <div className="registroDocumentoChoferes-row">
                <div className="registroDocumentoChoferes-field">
                  <label>Fecha de Emisión</label>
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="registroDocumentoChoferes-field">
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

            <section className="registroDocumentoChoferes-section">
              <h2 className="registroDocumentoChoferes-sectionTitle">Documento Digital</h2>
              
              <div className="registroDocumentoChoferes-field">
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

            <div className="registroDocumentoChoferes-actions">
              <button 
                type="submit" 
                className="registroDocumentoChoferes-submitBtn"
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

export default RegistroDocumentoChoferes;