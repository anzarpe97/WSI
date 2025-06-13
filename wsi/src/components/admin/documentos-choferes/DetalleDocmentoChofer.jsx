import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faFileAlt, 
  faUser, 
  faCalendarAlt, 
  faCheckCircle, 
  faTimesCircle,
  faClock,
  faIdCard,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../header';
import '../../../styles/DetalleDocumentoChofer.css';
import { verifyToken } from "../../../services/auth";

const DetalleDocumentoChofer = () => {
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Verificar token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await verifyToken();
        if (!result.isValid) {
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();
  }, [navigate]);

  // Obtener datos del documento desde la API
  useEffect(() => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    fetch(`http://localhost:8000/api/documentos-chofer/${id}/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se encontró el documento');
        return res.json();
      })
      .then(data => {
         console.log('Datos recibidos del backend:', data);
            setDocumento({
            id: data.id_documento_chofer || id,
            tipo: data.tipo_documento || 'Documento',
            estado: data.estado || 'Desconocido',
            fechaEmision: data.fecha_emision,
            fechaVencimiento: data.fecha_caducidad,
            chofer: data.chofer_info || {
                nombre: data.chofer_nombre,
                apellido: data.chofer_apellido,
                cedula: data.numero_documento,
                id: data.chofer
            },
            observaciones: data.observaciones || '',
            archivoUrl: data.ruta_documento || data.archivo || '',
            formato: '', // Si tienes un campo para el formato, ponlo aquí
            tamaño: '',  // Si tienes un campo para el tamaño, ponlo aquí
            });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const formatFecha = (fechaString) => {
    try {
      if (!fechaString) return "No disponible";
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const calcularDiasRestantes = (fechaVencimiento) => {
    try {
      if (!fechaVencimiento) return "No disponible";
      const hoy = new Date();
      const vencimiento = new Date(fechaVencimiento);
      const diffTime = vencimiento - hoy;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const handleDescargar = () => {
    if (documento?.archivoUrl) {
      window.open(documento.archivoUrl, '_blank');
    } else {
      alert('No hay archivo disponible para descargar.');
    }
  };

  if (loading) {
    return (
      <div className="detalle-documento-chofer-loader-container">
        <div className="detalle-documento-chofer-loader"></div>
        <p>Cargando documento...</p>
      </div>
    );
  }

  if (error || !documento) {
    return (
      <div className="detalle-documento-chofer-home-wrapper">
        <div className="detalle-documento-chofer-bg"></div>
        <Header title="WSI" />
        <div className="detalle-documento-chofer-container">
          <div className="detalle-documento-chofer-card">
            <h2 className="detalle-documento-chofer-titulo">Error al cargar el documento</h2>
            <p>{error || "No se pudo cargar la información del documento solicitado."}</p>
            <button className="detalle-documento-chofer-boton-volver" onClick={handleVolver}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(documento.fechaVencimiento);
  const estadoColor = documento.estado === 'Vigente' ? '#52c41a' : '#ff4d4f';
  const estadoBgColor = documento.estado === 'Vigente' ? '#f6ffed' : '#fff2f0';
  const estadoBorde = documento.estado === 'Vigente' ? '#b7eb8f' : '#ffccc7';

  return (
    <div className="detalle-documento-chofer-home-wrapper">
      {/* Fondo con efecto sutil */}
      <div className="detalle-documento-chofer-bg"></div>

      {/* Header */}
      <Header title="WSI" />
      
      <div className="detalle-documento-chofer-container">
        <div className="detalle-documento-chofer-card">
          {/* Header con botón de volver y título */}
          <div className="detalle-documento-chofer-header">
            <button className="detalle-documento-chofer-boton-volver" onClick={handleVolver}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
              Volver
            </button>
            <h2 className="detalle-documento-chofer-titulo">Documento del Chofer</h2>
          </div>
          
          {/* Tarjeta de información básica */}
          <div className="detalle-documento-chofer-resumen">
            <div className="detalle-documento-chofer-icono">
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div className="detalle-documento-chofer-info-basica">
              <h3>{documento.tipo}</h3>
              <div className="detalle-documento-chofer-estado" style={{
                backgroundColor: estadoBgColor,
                color: estadoColor,
                border: `1px solid ${estadoBorde}`
              }}>
                <FontAwesomeIcon 
                  icon={documento.estado === 'Vigente' ? faCheckCircle : faTimesCircle} 
                  style={{ marginRight: '6px' }} 
                />
                {documento.estado}
              </div>
            </div>
          </div>
          
          {/* Visualizador de documentos */}
          <div className="detalle-documento-chofer-visualizador">
            <div className="detalle-documento-chofer-visualizador-contenedor">
              {documento.formato && documento.formato.includes('image') && documento.archivoUrl ? (
                <img 
                  src={documento.archivoUrl} 
                  alt={documento.tipo} 
                  className="detalle-documento-chofer-imagen"
                />
              ) : (
                <div className="detalle-documento-chofer-pdf-placeholder">
                  <FontAwesomeIcon icon={faFileAlt} size="4x" />
                  <p>Vista previa no disponible para este archivo</p>
                  <button 
                    className="detalle-documento-chofer-descargar-btn"
                    onClick={handleDescargar}
                  >
                    <FontAwesomeIcon icon={faDownload} /> Descargar documento
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Detalles del documento */}
          <div className="detalle-documento-chofer-detalles-grid">
            <div className="detalle-documento-chofer-detalle-card">
              <div className="detalle-documento-chofer-detalle-icono">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="detalle-documento-chofer-detalle-contenido">
                <h3>Información del Chofer</h3>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Nombre:</span>
                  <span className="detalle-documento-chofer-detalle-valor">
                    {documento.chofer?.nombre || "No disponible"} {documento.chofer?.apellido || ""}
                  </span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Cédula:</span>
                  <span className="detalle-documento-chofer-detalle-valor">
                    {documento.chofer?.cedula || "No disponible"}
                  </span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">ID Chofer:</span>
                  <span className="detalle-documento-chofer-detalle-valor">
                    {documento.chofer?.id || "No disponible"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="detalle-documento-chofer-detalle-card">
              <div className="detalle-documento-chofer-detalle-icono">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="detalle-documento-chofer-detalle-contenido">
                <h3>Vigencia del Documento</h3>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Emisión:</span>
                  <span className="detalle-documento-chofer-detalle-valor">
                    {formatFecha(documento.fechaEmision)}
                  </span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Vencimiento:</span>
                  <span className="detalle-documento-chofer-detalle-valor">
                    {formatFecha(documento.fechaVencimiento)}
                  </span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Días restantes:</span>
                  <span className="detalle-documento-chofer-detalle-valor" style={{
                    color: diasRestantes < 30 ? '#ff4d4f' : '#52c41a',
                    fontWeight: '600'
                  }}>
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: '6px' }} />
                    {diasRestantes} días
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="detalle-documento-chofer-info-adicional">
            <div className="detalle-documento-chofer-detalle-icono">
              <FontAwesomeIcon icon={faIdCard} />
            </div>
            <div className="detalle-documento-chofer-info-adicional-contenido">
              <h3>Detalles Adicionales</h3>
              <div className="detalle-documento-chofer-info-adicional-fila">
                <span className="detalle-documento-chofer-info-adicional-etiqueta">ID Documento:</span>
                <span className="detalle-documento-chofer-info-adicional-valor">
                  {documento.id}
                </span>
              </div>
              <div className="detalle-documento-chofer-info-adicional-fila">
                <span className="detalle-documento-chofer-info-adicional-etiqueta">Formato:</span>
                <span className="detalle-documento-chofer-info-adicional-valor">
                  {documento.formato || "No disponible"}
                </span>
              </div>
              <div className="detalle-documento-chofer-info-adicional-fila">
                <span className="detalle-documento-chofer-info-adicional-etiqueta">Tamaño:</span>
                <span className="detalle-documento-chofer-info-adicional-valor">
                  {documento.tamaño || "No disponible"}
                </span>
              </div>
              <div className="detalle-documento-chofer-info-adicional-fila">
                <span className="detalle-documento-chofer-info-adicional-etiqueta">Observaciones:</span>
                <span className="detalle-documento-chofer-info-adicional-valor">
                  {documento.observaciones || "No disponible"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Botón de acción */}
          <div className="detalle-documento-chofer-acciones">
            <button 
              className="detalle-documento-chofer-descargar-btn"
              onClick={handleDescargar}
            >
              <FontAwesomeIcon icon={faDownload} /> Descargar documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleDocumentoChofer;