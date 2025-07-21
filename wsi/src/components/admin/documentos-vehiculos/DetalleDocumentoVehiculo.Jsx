import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFileAlt,
  faCar,
  faCalendarAlt,
  faClock,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../header';
import '../../../styles/DetalleDocumentoChofer.css';
import { verifyToken } from '../../../services/auth';

const DetalleDocumentoVehiculo = () => {
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

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

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8000/api/documentos-vehiculos/${id}/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se encontró el documento');
        return res.json();
      })
      .then(data => {
        setDocumento({
          id: data.id_documento_vehiculo || id,
          tipo: data.tipo_documento || 'Documento',
          numero: data.numero_documento || '',
          fechaEmision: data.fecha_emision,
          fechaVencimiento: data.fecha_caducidad,
          vehiculo: {
            placa: data.vehiculo_placa || '',
            marca: data.vehiculo_marca || '',
            id: data.Vehiculo || ''
          },
          archivoUrl: data.archivo || '',
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
      if (!fechaString) return 'No disponible';
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const calcularDiasRestantes = (fechaVencimiento) => {
    try {
      if (!fechaVencimiento) return 'No disponible';
      const hoy = new Date();
      const vencimiento = new Date(fechaVencimiento);
      const diffTime = vencimiento - hoy;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
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
            <p>{error || 'No se pudo cargar la información del documento solicitado.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(documento.fechaVencimiento);
  // Detectar si el archivo es una imagen por extensión
  const esImagen = documento.archivoUrl && (
    documento.archivoUrl.toLowerCase().endsWith('.jpg') ||
    documento.archivoUrl.toLowerCase().endsWith('.jpeg') ||
    documento.archivoUrl.toLowerCase().endsWith('.png') ||
    documento.archivoUrl.toLowerCase().endsWith('.gif') ||
    documento.archivoUrl.toLowerCase().endsWith('.bmp') ||
    documento.archivoUrl.toLowerCase().endsWith('.webp')
  );

  return (
    <div className="detalle-documento-chofer-home-wrapper">
      {/* Fondo con efecto sutil */}
      <div className="detalle-documento-chofer-bg"></div>
      <Header title="WSI" />
      <div className="detalle-documento-chofer-container">
        <div className="detalle-documento-chofer-card">
          <div className="detalle-documento-chofer-header">
            <button className="detalle-documento-chofer-boton-volver" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </button>
            <h2 className="detalle-documento-chofer-titulo">Documento del Vehículo</h2>
          </div>
          <div className="detalle-documento-chofer-resumen">
            <div className="detalle-documento-chofer-icono">
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div className="detalle-documento-chofer-info-basica">
              <h3>{documento.tipo}</h3>
              <div style={{ color: '#888', fontSize: '15px', marginTop: '6px' }}>
                Número: <b>{documento.numero}</b>
              </div>
            </div>
          </div>
          <div className="detalle-documento-chofer-visualizador">
            <div className="detalle-documento-chofer-visualizador-contenedor">
              {esImagen ? (
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
          <div className="detalle-documento-chofer-detalles-grid">
            <div className="detalle-documento-chofer-detalle-card">
              <div className="detalle-documento-chofer-detalle-icono">
                <FontAwesomeIcon icon={faCar} />
              </div>
              <div className="detalle-documento-chofer-detalle-contenido">
                <h3>Información del Vehículo</h3>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Placa:</span>
                  <span className="detalle-documento-chofer-detalle-valor">{documento.vehiculo?.placa || 'No disponible'}</span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Marca:</span>
                  <span className="detalle-documento-chofer-detalle-valor">{documento.vehiculo?.marca || 'No disponible'}</span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">ID Vehículo:</span>
                  <span className="detalle-documento-chofer-detalle-valor">{documento.vehiculo?.id || 'No disponible'}</span>
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
                  <span className="detalle-documento-chofer-detalle-valor">{formatFecha(documento.fechaEmision)}</span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Vencimiento:</span>
                  <span className="detalle-documento-chofer-detalle-valor">{formatFecha(documento.fechaVencimiento)}</span>
                </div>
                <div className="detalle-documento-chofer-detalle-fila">
                  <span className="detalle-documento-chofer-detalle-etiqueta">Días restantes:</span>
                  <span className="detalle-documento-chofer-detalle-valor" style={{ color: diasRestantes < 30 ? '#ff4d4f' : '#52c41a', fontWeight: '600' }}>
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: '6px' }} />
                    {diasRestantes} días
                  </span>
                </div>
              </div>
            </div>
          </div>
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

export default DetalleDocumentoVehiculo;
