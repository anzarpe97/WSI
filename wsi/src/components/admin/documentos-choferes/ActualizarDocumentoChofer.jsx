import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faEdit, faEye, faDownload, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../../styles/ActualizarDocumentoChofer.css";
import bgImage from '../../../assets/bg-login.jpg'
import Header from '../../header';
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../../services/auth";

const ActualizarDocumentoChofer = () => {
  const [cedula, setCedula] = useState('');
  const [choferInfo, setChoferInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [cedulaError, setCedulaError] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
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
    checkAuth();

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
  }, [navigate]);

  const validarCedula = (cedula) => /^\d{7,8}$/.test(cedula);

  document.title = "WSI - Actualizar Documentos Choferes";

  const handleCedulaSearch = async () => {
    if (!cedula.trim()) {
      setCedulaError('Por favor ingrese una cédula');
      setChoferInfo(null);
      setDocumentos([]);
      return;
    }
    if (!validarCedula(cedula)) {
      setCedulaError('Formato inválido (debe contener entre 7 - 8 dígitos numéricos)');
      setChoferInfo(null);
      setDocumentos([]);
      return;
    }

    setCedulaError('');
    setIsSearching(true);
    setDocumentos([]);
    setDocumentoSeleccionado(null);
    setModoEdicion(false);

    try {
      // Buscar primero el chofer por cédula
      const response = await fetch(`http://localhost:8000/api/choferes/?cedula=${cedula}&rol=2`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.id && data.nombre && data.apellido) {
          setChoferInfo({
            id: data.id,
            nombre: data.nombre,
            apellido: data.apellido
          });
          // Solo si existe el chofer, buscar sus documentos en el endpoint correcto
          try {
            const docsResponse = await fetch(`http://localhost:8000/api/documentos-choferes-verificar/?chofer=${data.id}`);
            if (docsResponse.ok) {
              const docsData = await docsResponse.json();
              if (docsData.length > 0) {
                setDocumentos(docsData);
                toast.success(`Chofer encontrado - ${docsData.length} documento(s) disponible(s)`);
              } else {
                toast.info("Chofer encontrado pero sin documentos registrados");
                setDocumentos([]);
              }
            } else {
              setDocumentos([]);
            }
          } catch {
            setDocumentos([]);
          }
        } else {
          setChoferInfo(null);
          setCedulaError("El número de cédula no ha sido registrado");
          setDocumentos([]);
        }
      } else {
        setChoferInfo(null);
        setCedulaError("El número de cédula no ha sido registrado");
        setDocumentos([]);
      }
    } catch {
      setChoferInfo(null);
      setCedulaError("Error al buscar chofer");
      setDocumentos([]);
    } finally {
      setIsSearching(false);
    }
  };

  const seleccionarDocumento = (documento) => {
    setDocumentoSeleccionado(documento);
    setTipoDocumento(documento.tipo_documento);
    setDocumentNumber(documento.numero_documento);
    setFechaEmision(documento.fecha_emision);
    setFechaCaducidad(documento.fecha_caducidad);
    setFile(null);
    setFileError('');
    setModoEdicion(true);
  };

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

  useEffect(() => {
    if (modoEdicion && tipoDocumento && fechaEmision) {
      const nuevaFechaCaducidad = calcularFechaCaducidad(tipoDocumento, fechaEmision);
      setFechaCaducidad(nuevaFechaCaducidad);

      if (nuevaFechaCaducidad && new Date(nuevaFechaCaducidad) < new Date()) {
        toast.warning('El documento está vencido. Considere actualizar la fecha de emisión.');
      }
    }
  }, [tipoDocumento, fechaEmision, modoEdicion]);

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
    return texto.replace(/[^A-Za-z0-9_]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!documentoSeleccionado) {
      toast.error('Debe seleccionar un documento para actualizar');
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

    const formData = new FormData();
    formData.append('chofer', choferInfo.id);
    formData.append('nombre', choferInfo.nombre);
    formData.append('apellido', choferInfo.apellido);
    formData.append('tipo_documento', tipoDocumento);
    formData.append('numero_documento', limpiarTexto(documentNumber));
    formData.append('fecha_emision', fechaEmision);
    formData.append('fecha_caducidad', fechaCaducidad);
    
    if (file) {
      const cedulaLimpia = limpiarTexto(cedula);
      const tipoDocumentoLimpio = limpiarTexto(tipoDocumento);
      const ext = file.name.split('.').pop();
      const newFileName = `${cedulaLimpia}_${tipoDocumentoLimpio}.${ext}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      formData.append('archivo', renamedFile);
    }

    try {
      // Usar SIEMPRE el campo correcto para el ID del documento
      const idDoc = documentoSeleccionado?.id_documento_chofer;
      if (!idDoc) {
        toast.error('No se pudo determinar el ID del documento a actualizar.');
        return;
      }
      const response = await fetch(`http://localhost:8000/api/documentos-chofer/${idDoc}/`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        toast.success('Documento actualizado exitosamente');
        // Refrescar la lista de documentos
        handleCedulaSearch();
        setModoEdicion(false);
        setDocumentoSeleccionado(null);
        setFormSubmitted(false);
      } else {
        const errorData = await response.json();
        console.log(errorData);
        toast.error('Error al actualizar el documento');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error de conexión con el servidor');
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setDocumentoSeleccionado(null);
    setTipoDocumento('');
    setDocumentNumber('');
    setFechaEmision('');
    setFechaCaducidad('');
    setFile(null);
    setFileError('');
    setFormSubmitted(false);
  };

  const getTipoDocumentoLabel = (tipo) => {
    const tipos = {
      'CEDULA_IDENTIDAD': 'Cédula de Identidad',
      'LICENCIA_CONDUCIR': 'Licencia de Conducir',
      'CARTA_MEDICA': 'Carta Médica'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoDocumento = (fechaCaducidad) => {
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad);
    const diasRestantes = Math.ceil((caducidad - hoy) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return { estado: 'Vencido', clase: 'vencido' };
    if (diasRestantes <= 30) return { estado: 'Por vencer', clase: 'por-vencer' };
    return { estado: 'Vigente', clase: 'vigente' };
  };

  return (
    <div className="actualizarDocumentoChoferes-wrapper">
      <Header title="WSI" />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="colored"
        pauseOnHover={false}
      />
      <div className="actualizarDocumentoChoferes-bg">
        <img src={bgImage} alt="Fondo" />
      </div>
      <div className="actualizarDocumentoChoferes-content">
        <div className="actualizarDocumentoChoferes-container">
          <h1 className="actualizarDocumentoChoferes-title">
            Actualizar Documentos de Choferes
          </h1>

          {/* Sección de búsqueda */}
          <section className="actualizarDocumentoChoferes-section">
            <h2 className="actualizarDocumentoChoferes-sectionTitle">Buscar Chofer</h2>
            
            <div className="actualizarDocumentoChoferes-field">
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

          {/* Lista de documentos */}
          {choferInfo && (
            <section className="actualizarDocumentoChoferes-section">
              <h2 className="actualizarDocumentoChoferes-sectionTitle">Documentos Registrados</h2>
              <div className="documentos-grid custom-docs-grid">
                {documentos.length > 0 ? (
                  documentos.map((doc) => {
                    const estadoInfo = getEstadoDocumento(doc.fecha_caducidad);
                    return (
                      <div
                        key={doc.id}
                        className={`documento-card custom-doc-card${documentoSeleccionado?.id === doc.id ? ' selected' : ''}`}
                        onMouseEnter={e => e.currentTarget.classList.add('hovered')}
                        onMouseLeave={e => e.currentTarget.classList.remove('hovered')}
                      >
                        <div className="doc-card-header">
                          <div className="doc-card-icon">
                            <FontAwesomeIcon icon={faFileAlt} className="doc-card-icon-inner" />
                          </div>
                          <div className="doc-card-tipo">
                            {getTipoDocumentoLabel(doc.tipo_documento)}
                          </div>
                          <div className={`doc-card-estado ${estadoInfo.clase}`}>{estadoInfo.estado}</div>
                        </div>
                        <div className="doc-card-info">
                          <div><strong>Número:</strong> {doc.numero_documento}</div>
                          <div><strong>Emisión:</strong> {new Date(doc.fecha_emision).toLocaleDateString()}</div>
                          <div><strong>Vencimiento:</strong> {new Date(doc.fecha_caducidad).toLocaleDateString()}</div>
                        </div>
                        <div className="doc-card-actions">
                          <button
                            type="button"
                            onClick={() => seleccionarDocumento(doc)}
                            className="btn-edit custom-btn-edit"
                            disabled={modoEdicion && documentoSeleccionado?.id !== doc.id}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="doc-card-empty">
                    No hay documentos registrados para este chofer.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Formulario de edición */}
          {modoEdicion && documentoSeleccionado && (
            <form onSubmit={handleSubmit} className="actualizarDocumentoChoferes-form">
              <section className="actualizarDocumentoChoferes-section editing">
                <h2 className="actualizarDocumentoChoferes-sectionTitle">
                  Actualizando: {getTipoDocumentoLabel(documentoSeleccionado.tipo_documento)}
                </h2>
                
                <div className="actualizarDocumentoChoferes-field">
                  <label>Tipo de Documento</label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    disabled
                    className="disabled-field"
                  >
                    <option value="CEDULA_IDENTIDAD">Cédula de Identidad</option>
                    <option value="LICENCIA_CONDUCIR">Licencia de Conducir</option>
                    <option value="CARTA_MEDICA">Carta Médica</option>
                  </select>
                </div>

                <div className="actualizarDocumentoChoferes-field">
                  <label>Número de Documento</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Ej: ABC-123456"
                    className={(!documentNumber && formSubmitted) ? 'input-error' : ''}
                  />
                  {!documentNumber && formSubmitted && (
                    <div className="error-message">Campo requerido</div>
                  )}
                </div>

                <div className="actualizarDocumentoChoferes-row">
                  <div className="actualizarDocumentoChoferes-field">
                    <label>Fecha de Emisión</label>
                    <input
                      type="date"
                      value={fechaEmision}
                      onChange={(e) => setFechaEmision(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={(!fechaEmision && formSubmitted) ? 'input-error' : ''}
                    />
                  </div>
                  <div className="actualizarDocumentoChoferes-field">
                    <label>Fecha de Caducidad</label>
                    <input
                      type="date"
                      value={fechaCaducidad}
                      readOnly
                      disabled
                      className="disabled-field"
                    />
                  </div>
                </div>

                <div className="actualizarDocumentoChoferes-field">
                  <label>Actualizar Documento Digital (PDF/JPG/PNG) - Opcional</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={fileError ? 'input-error' : ''}
                  />
                  {file && (
                    <div className="file-preview">
                      Nuevo archivo: {file.name}
                    </div>
                  )}
                  {fileError && (
                    <div className="error-message">
                      {fileError}
                    </div>
                  )}
                  <div className="file-help">
                    Si no selecciona un archivo, se mantendrá el documento actual
                  </div>
                </div>

                <div className="actualizarDocumentoChoferes-actions">
                  <button 
                    type="button"
                    onClick={cancelarEdicion}
                    className="actualizarDocumentoChoferes-cancelBtn form-action-btn"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="actualizarDocumentoChoferes-submitBtn form-action-btn"
                  >
                    Actualizar Documento
                  </button>
                </div>
              </section>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActualizarDocumentoChofer;