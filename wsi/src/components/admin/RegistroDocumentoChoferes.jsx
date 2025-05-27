import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../styles/RegistroDocumentoChoferes.css";
import bgImage from '../../assets/bg-login.jpg';
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
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (!(result.isValid && result.user)) {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

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
        } else {
          setChoferInfo(null);
          setCedulaError("El número de cédula no ha sido registrado");
        }
      } else {
        setChoferInfo(null);
        setCedulaError("El número de cédula no ha sido registrado");
      }
    } catch {
      setChoferInfo(null);
      setCedulaError("Error al buscar chofer");
    } finally {
      setIsSearching(false);
    }
  };

  const validateDates = () => {
    if (fechaEmision && fechaCaducidad && new Date(fechaCaducidad) < new Date(fechaEmision)) {
      setFechaError('La caducidad debe ser posterior a la emisión');
      return false;
    }
    setFechaError('');
    return true;
  };

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
    if (!validateDates()) return;
    if (!file) {
      toast.error('Debe subir el documento digital');
      return;
    }

    const formData = new FormData();
    formData.append('cedula', cedula);
    formData.append('chofer', choferInfo.id);
    formData.append('nombre', choferInfo.nombre);
    formData.append('apellido', choferInfo.apellido);
    formData.append('tipo_documento', tipoDocumento);
    formData.append('numero_documento', documentNumber);
    formData.append('fecha_emision', fechaEmision);
    formData.append('fecha_caducidad', fechaCaducidad);
    formData.append('archivo', file);

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
      } else {
        toast.error('Error al registrar el documento');
      }
    } catch (error) {
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
          <img src={bgImage} alt="Fondo de pantalla abstracto" />
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
                  <option value="CEDULA_IDENTIDAD">Cedula de Identidad</option>
                  <option value="LICENCIA_CONDUCIR">Licencia De Conducir</option>
                  <option value="CARTA_MEDICA">Carta Medica</option>
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
                    onChange={(e) => setFechaCaducidad(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    min={fechaEmision}
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