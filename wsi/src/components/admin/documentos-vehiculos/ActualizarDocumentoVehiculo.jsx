import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faFileAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import Header from '../../header';
import '../../../styles/ActualizarDocumentoVehiculo.css';
import { toast, ToastContainer } from 'react-toastify';
import { verifyToken } from '../../../services/auth';
import bgImage from '../../../assets/bg-login.jpg';

const ActualizarDocumentoVehiculo = () => {
  const [placa, setPlaca] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [placaError, setPlacaError] = useState('');
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
          if (String(result.user.rol) !== '0' && String(result.user.rol) !== '1') {
            if (String(result.user.rol) === '2') {
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

  const validarPlaca = (p) => /^[A-Za-z0-9-]{5,20}$/.test(p);

  document.title = 'WSI - Actualizar Documentos Vehículos';

  const handlePlacaSearch = async () => {
    if (!placa.trim()) {
      setPlacaError('Por favor ingrese una placa');
      setVehiculoInfo(null);
      setDocumentos([]);
      return;
    }
    if (!validarPlaca(placa)) {
      setPlacaError('Formato inválido (5-20 caracteres, letras/números)');
      setVehiculoInfo(null);
      setDocumentos([]);
      return;
    }
    setPlacaError('');
    setIsSearching(true);
    setDocumentos([]);
    setDocumentoSeleccionado(null);
    setModoEdicion(false);
    try {
      // Buscar primero el vehículo por placa
      const response = await fetch(`http://localhost:8000/api/vehiculos/buscar/?placa=${placa}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.id_vehiculo && data.placa) {
          setVehiculoInfo({
            id: data.id_vehiculo,
            placa: data.placa,
            marca: data.marca,
            modelo: data.modelo
          });
          // Buscar documentos del vehículo
          try {
            const docsResponse = await fetch(`http://localhost:8000/api/documentos-vehiculos/?vehiculo=${data.id_vehiculo}`);
            if (docsResponse.ok) {
              const docs = await docsResponse.json();
              setDocumentos(Array.isArray(docs) ? docs : []);
            } else {
              setDocumentos([]);
            }
          } catch {
            setDocumentos([]);
          }
        } else {
          setVehiculoInfo(null);
          setPlacaError('La placa no ha sido registrada');
          setDocumentos([]);
        }
      } else {
        setVehiculoInfo(null);
        setPlacaError('La placa no ha sido registrada');
        setDocumentos([]);
      }
    } catch {
      setVehiculoInfo(null);
      setPlacaError('Error al buscar vehículo');
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
    if (tipo === 'RCV') anios = 1;
    if (tipo === 'TRIMESTRES') anios = 1;
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
    formData.append('Vehiculo', vehiculoInfo.id);
    formData.append('tipo_documento', tipoDocumento);
    formData.append('numero_documento', limpiarTexto(documentNumber));
    formData.append('fecha_emision', fechaEmision);
    formData.append('fecha_caducidad', fechaCaducidad);
    if (file) {
      const placaLimpia = limpiarTexto(vehiculoInfo.placa);
      const tipoDocumentoLimpio = limpiarTexto(tipoDocumento);
      const ext = file.name.split('.').pop();
      const newFileName = `${placaLimpia}_${tipoDocumentoLimpio}.${ext}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      formData.append('archivo', renamedFile);
    }
    try {
      const idDoc = documentoSeleccionado?.id_documento_vehiculo;
      if (!idDoc) {
        toast.error('No se pudo determinar el ID del documento a actualizar.');
        return;
      }
      const response = await fetch(`http://localhost:8000/api/documentos-vehiculos/${idDoc}/`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        toast.success('Documento actualizado exitosamente');
        handlePlacaSearch();
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
      'RCV': 'RCV',
      'TRIMESTRES': 'Trimestres',
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
    <div className="actualizarDocumentoVehiculo-wrapper">
      <Header title="WSI" />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" pauseOnHover={false} />
      <div className="actualizarDocumentoVehiculo-bg">
        <img src={bgImage} alt="Fondo" />
      </div>
      <div className="actualizarDocumentoVehiculo-content">
        <div className="actualizarDocumentoVehiculo-container">
          <h1 className="actualizarDocumentoVehiculo-title">Actualizar Documentos de Vehículos</h1>
          {/* Sección de búsqueda */}
          <section className="actualizarDocumentoVehiculo-section">
            <h2 className="actualizarDocumentoVehiculo-sectionTitle">Buscar Vehículo</h2>
            <div className="actualizarDocumentoVehiculo-field">
              <label>Placa del Vehículo</label>
              <div className="placa-search-container">
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
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
                <div id="placa-error" className="error-message">{placaError}</div>
              )}
            </div>
            {vehiculoInfo && (
              <div className="vehiculo-info-container">
                <div className="vehiculo-info-details">
                  <div><strong>Placa:</strong> {vehiculoInfo.placa}</div>
                  <div><strong>Marca:</strong> {vehiculoInfo.marca}</div>
                  <div><strong>Modelo:</strong> {vehiculoInfo.modelo}</div>
                </div>
              </div>
            )}
          </section>
          {/* Lista de documentos */}
          {vehiculoInfo && (
            <section className="actualizarDocumentoVehiculo-section">
              <h2 className="actualizarDocumentoVehiculo-sectionTitle">Documentos Registrados</h2>
              <div className="documentos-grid custom-docs-grid">
                {documentos.length > 0 ? (
                  documentos.map((doc) => {
                    const estadoInfo = getEstadoDocumento(doc.fecha_caducidad);
                    return (
                      <div
                        key={doc.id_documento_vehiculo}
                        className={`documento-card custom-doc-card${documentoSeleccionado?.id_documento_vehiculo === doc.id_documento_vehiculo ? ' selected' : ''}`}
                        onMouseEnter={e => e.currentTarget.classList.add('hovered')}
                        onMouseLeave={e => e.currentTarget.classList.remove('hovered')}
                      >
                        <div className="doc-card-header">
                          <div className="doc-card-icon">
                            <FontAwesomeIcon icon={faFileAlt} className="doc-card-icon-inner" />
                          </div>
                          <div className="doc-card-tipo">{getTipoDocumentoLabel(doc.tipo_documento)}</div>
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
                            disabled={modoEdicion && documentoSeleccionado?.id_documento_vehiculo !== doc.id_documento_vehiculo}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="doc-card-empty">No hay documentos registrados para este vehículo.</div>
                )}
              </div>
            </section>
          )}
          {/* Formulario de edición */}
          {modoEdicion && documentoSeleccionado && (
            <form onSubmit={handleSubmit} className="actualizarDocumentoVehiculo-form">
              <section className="actualizarDocumentoVehiculo-section editing">
                <h2 className="actualizarDocumentoVehiculo-sectionTitle">
                  Actualizando: {getTipoDocumentoLabel(documentoSeleccionado.tipo_documento)}
                </h2>
                <div className="actualizarDocumentoVehiculo-field">
                  <label>Tipo de Documento</label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    disabled
                    className="disabled-field"
                  >
                    <option value="RCV">RCV</option>
                    <option value="TRIMESTRES">Trimestres</option>
                  </select>
                </div>
                <div className="actualizarDocumentoVehiculo-field">
                  <label>Número de Documento</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Ej: 123456"
                    className={(!documentNumber && formSubmitted) ? 'input-error' : ''}
                  />
                  {!documentNumber && formSubmitted && (
                    <div className="error-message">Campo requerido</div>
                  )}
                </div>
                <div className="actualizarDocumentoVehiculo-row">
                  <div className="actualizarDocumentoVehiculo-field">
                    <label>Fecha de Emisión</label>
                    <input
                      type="date"
                      value={fechaEmision}
                      onChange={(e) => setFechaEmision(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={(!fechaEmision && formSubmitted) ? 'input-error' : ''}
                    />
                  </div>
                  <div className="actualizarDocumentoVehiculo-field">
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
                <div className="actualizarDocumentoVehiculo-field">
                  <label>Actualizar Documento Digital (PDF/JPG/PNG) - Opcional</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={fileError ? 'input-error' : ''}
                  />
                  {file && (
                    <div className="file-preview">Nuevo archivo: {file.name}</div>
                  )}
                  {fileError && (
                    <div className="error-message">{fileError}</div>
                  )}
                  <div className="file-help">Si no selecciona un archivo, se mantendrá el documento actual</div>
                </div>
                <div className="actualizarDocumentoVehiculo-actions">
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="actualizarDocumentoVehiculo-cancelBtn form-action-btn"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="actualizarDocumentoVehiculo-submitBtn form-action-btn"
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

export default ActualizarDocumentoVehiculo;
