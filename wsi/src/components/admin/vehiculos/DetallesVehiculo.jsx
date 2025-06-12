import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faEdit, faPrint, faGasPump, faWeightHanging,
  faGauge, faMoneyBill, faWeight, faCalendarAlt, faDollarSign,
  faCar, faIdCard, faPalette, faCalendar, faCogs, faChartLine,
  faWrench, faTools, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../../header';
import { verifyToken } from '../../../services/auth';
import '../../../styles/DetalleVehiculo.css';

const DetalleVehiculo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef();

  // --- INACTIVIDAD ---
  const inactivityTimer = useRef(null);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    if (isInactivityLogout) {
      setShowInactivityModal(true);
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { sessionExpired: true }
        });
      }, 2500);
    } else {
      navigate('/login', { replace: true });
    }
  };

  // Verificar rol del usuario al montar
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
  }, [navigate]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchVehiculo = async () => {
      setLoading(true);
      setError('');
      try {
        // Obtener vehículo
        const response = await fetch(`http://localhost:8000/api/vehiculos/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            logout();
            return;
          }
          throw new Error('No se pudo cargar el vehículo');
        }
        const data = await response.json();
        setVehiculo(data);

        // Mantenimientos de ejemplo (puedes reemplazar esto con una llamada real a la API)
        setMantenimientos([
          {
            id: 1,
            tipo: 'Cambio de aceite',
            fecha: '2023-10-15T14:30:00Z',
            costo: 120.50,
            descripcion: 'Cambio de aceite y filtro según especificaciones del fabricante.',
            kilometraje: 15000,
            estado: 'COMPLETADO'
          }
        ]);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la información completa');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchVehiculo();
    } else {
      logout();
    }
  }, [id, navigate]);

  const handleVolver = () => {
    navigate(-1); // Vuelve a la página anterior
  };

  const handleEditar = () => {
    if (vehiculo && vehiculo.id_vehiculo) {
      navigate(`/editar-vehiculo/${vehiculo.id_vehiculo}`);
    }
  };

  const getColorCode = (colorName) => {
    const colors = {
      'blanco': '#ffffff', 'white': '#ffffff',
      'rojo': '#ff0000', 'red': '#ff0000',
      'azul': '#0000ff', 'blue': '#0000ff',
      'negro': '#000000', 'black': '#000000',
      'gris': '#808080', 'gray': '#808080',
      'verde': '#008000', 'green': '#008000',
      'amarillo': '#ffff00', 'yellow': '#ffff00',
      'plateado': '#c0c0c0', 'silver': '#c0c0c0'
      // Añade más colores según necesites
    };
    return colors[String(colorName)?.toLowerCase()] || '#cccccc'; // Gris por defecto si no se encuentra
  };

  const formatEstado = (estado) => {
    if (!estado) return 'N/A';
    const estadoFormateado = String(estado).toUpperCase().replace(/_/g, ' ');
    if (estadoFormateado === "EN MANTENIMIENTO") return "MANTENIMIENTO";
    return estadoFormateado;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const formatFechaHora = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

const handleGenerarReporte = () => {
  if (!vehiculo) return;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Estilo para el PDF
  const primaryColor = '#ff6a00'; // Usar formato hexadecimal
  const secondaryColor = '#17a2b8';
  const lightGray = '#f0f0f0';
  const darkGray = '#333333';
  
  // Logo y encabezado
  doc.setFillColor(255, 106, 0); // Usar valores RGB directamente
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Vehículo', 105, 18, null, null, 'center');
  
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 25, null, null, 'center');
  
  // Información principal del vehículo
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`${vehiculo.marca} ${vehiculo.modelo}`, 20, 45);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Placa: ${vehiculo.placa}`, 20, 52);
  doc.text(`Año: ${vehiculo.anio}`, 20, 58);
  
  // Estado con estilo
  const estado = formatEstado(vehiculo.estado);
  doc.setFillColor(estado === 'MANTENIMIENTO' ? 255 : 212, 
                   estado === 'MANTENIMIENTO' ? 243 : 237, 
                   estado === 'MANTENIMIENTO' ? 205 : 218);
  const estadoWidth = doc.getStringUnitWidth(estado) * 12;
  doc.rect(150, 40, estadoWidth + 10, 8, 'F');
  
  doc.setTextColor(estado === 'MANTENIMIENTO' ? 133 : 21, 
                   estado === 'MANTENIMIENTO' ? 100 : 87, 
                   estado === 'MANTENIMIENTO' ? 4 : 36);
  doc.text(estado, 155, 46);
  
  // Tabla de información con estilo moderno
  autoTable(doc, {
    startY: 65,
    head: [['Información', 'Detalle']],
    body: [
      ['Color', vehiculo.color || 'N/A'],
      ['Tipología', vehiculo.tipologia || 'N/A'],
      ['Motor', vehiculo.motor || 'N/A'],
      ['Capacidad de carga', vehiculo.capacidad_carga ? `${vehiculo.capacidad_carga} kg` : 'N/A'],
      ['Combustible', vehiculo.tipo_combustible && vehiculo.capacidad_combustible 
        ? `${vehiculo.tipo_combustible} (${vehiculo.capacidad_combustible} L)` 
        : 'N/A'],
      ['Kilometraje', vehiculo.kilometraje 
        ? `${vehiculo.kilometraje.toLocaleString()} km` 
        : 'N/A'],
      ['Costo', vehiculo.costo 
        ? `$${vehiculo.costo.toLocaleString('es-ES')}` 
        : 'N/A'],
      ['Fecha de creación', formatFecha(vehiculo.fecha_creado) || 'N/A']
    ],
    styles: {
      font: 'helvetica',
      fontSize: 11,
      cellPadding: 6,
      lineColor: [200, 200, 200],
      lineWidth: 0.25
    },
    headStyles: {
      fillColor: [255, 106, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 12
    },
    bodyStyles: {
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Sección de mantenimientos
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  const finalY = doc.lastAutoTable.finalY || 80;
  doc.text('Últimos Mantenimientos', 20, finalY + 15);
  
  if (mantenimientos.length > 0) {
    const mantenimientosData = mantenimientos.map(mant => [
      mant.tipo,
      new Date(mant.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      `$${mant.costo.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      `${mant.kilometraje.toLocaleString()} km`
    ]);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Tipo', 'Fecha', 'Costo', 'Kilometraje']],
      body: mantenimientosData,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.25
      },
      headStyles: {
        fillColor: [23, 162, 184],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('No se han registrado mantenimientos', 30, finalY + 25);
  }

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('© WSI - Sistema de Gestión de Vehículos', 105, 285, null, null, 'center');

  doc.save(`Reporte_Vehiculo_${vehiculo.placa}.pdf`);
};

  if (loading) return (
    <div className="vehiculo-loader-container">
      <div className="vehiculo-loader"></div>
      <p>Cargando detalles del vehículo...</p>
    </div>
  );

  if (error) return (
    <div className="vehiculo-home-wrapper">
      <Header title="WSI" />
      <div className="detalle-vehiculo-container">
        <div className="detalle-vehiculo-card error-card">
          <h2 className="detalle-vehiculo-titulo">Error</h2>
          <p>{error}</p>
          <button className="detalle-vehiculo-boton-volver" onClick={handleVolver}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
        </div>
      </div>
    </div>
  );

  if (!vehiculo) return ( // Si no hay vehículo después de cargar y sin error, es un estado inesperado
    <div className="vehiculo-home-wrapper">
      <Header title="WSI" />
      <div className="detalle-vehiculo-container">
         <p>No se encontró el vehículo.</p>
         <button className="detalle-vehiculo-boton-volver" onClick={handleVolver}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
      </div>
    </div>
  );

  return (
    <div className="vehiculo-home-wrapper">
      <Header title="WSI" />

      <div className="detalle-vehiculo-container" ref={reportRef}>
        <div className="detalle-vehiculo-card">
          <div className="detalle-vehiculo-header">
            <h2 className="detalle-vehiculo-titulo">Detalles del Vehículo</h2>
            <div className="detalle-vehiculo-acciones">
              <button
                className="detalle-vehiculo-boton-editar"
                onClick={handleEditar}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                className="detalle-vehiculo-boton-imprimir"
                onClick={handleGenerarReporte}
              >
                <FontAwesomeIcon icon={faPrint} />
              </button>
            </div>
          </div>

          <div className="detalle-vehiculo-profile">
            <div className="avatar-vehiculo">
              <FontAwesomeIcon icon={faCar} size="3x" />
            </div>
            <div className="detalle-vehiculo-nombre">
              {vehiculo.marca} {vehiculo.modelo}
            </div>
            <div className="detalle-vehiculo-placa">
              {vehiculo.placa}
            </div>
          </div>

          <div className="detalle-vehiculo-info-grid">
            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faIdCard} />
              </div>
              <div className="info-content">
                <h3>Información General</h3>
                <div className="info-row">
                  <span className="info-label">Estado:</span>
                  <span className={`info-value estado ${String(vehiculo.estado)?.toLowerCase()}`}>
                    {formatEstado(vehiculo.estado)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Color:</span>
                  <span className="info-value">
                    <span
                      className="color-indicator"
                      style={{ backgroundColor: getColorCode(vehiculo.color) }}
                    ></span>
                    {vehiculo.color || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Año:</span>
                  <span className="info-value">{vehiculo.anio || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faCogs} />
              </div>
              <div className="info-content">
                <h3>Especificaciones</h3>
                <div className="info-row">
                  <span className="info-label">Tipología:</span>
                  <span className="info-value">{vehiculo.tipologia || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Motor:</span>
                  <span className="info-value">{vehiculo.motor || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Capacidad Carga:</span>
                  <span className="info-value">{vehiculo.capacidad_carga ? `${vehiculo.capacidad_carga} kg` : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faGasPump} />
              </div>
              <div className="info-content">
                <h3>Combustible</h3>
                <div className="info-row">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{vehiculo.tipo_combustible || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Capacidad Tanque:</span>
                  <span className="info-value">{vehiculo.capacidad_combustible ? `${vehiculo.capacidad_combustible} L` : 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Kilometraje:</span>
                  <span className="info-value">{vehiculo.kilometraje?.toLocaleString('es-ES')} km</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faMoneyBill} />
              </div>
              <div className="info-content">
                <h3>Finanzas</h3>
                <div className="info-row">
                  <span className="info-label">Costo:</span>
                  <span className="info-value">
                    {vehiculo.costo ? `$${Number(vehiculo.costo).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Fecha Registro:</span>
                  <span className="info-value">{formatFecha(vehiculo.fecha_creado)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Mantenimientos */}
          <div className="mantenimientos-section">
            <h3 className="section-title">
              <FontAwesomeIcon icon={faTools} /> Último Mantenimiento Registrado
            </h3>

            {mantenimientos.length === 0 ? (
              <div className="no-mantenimientos">
                <FontAwesomeIcon icon={faFileAlt} size="2x" />
                <p>Este vehículo no tiene mantenimientos registrados.</p>
              </div>
            ) : (
              <div className="mantenimientos-container">
                {mantenimientos.slice(0, 1).map(mant => ( // Mostrar solo el último
                  <div className="mantenimiento-card" key={mant.id}>
                    <div className="mantenimiento-header">
                      <span className="mantenimiento-fecha">{formatFechaHora(mant.fecha)}</span>
                      <span className={`mantenimiento-estado ${String(mant.estado)?.toLowerCase() || 'completado'}`}>
                        {String(mant.estado)?.toUpperCase() || 'COMPLETADO'}
                      </span>
                    </div>
                    <div className="mantenimiento-body">
                      <h4 className="mantenimiento-titulo">{mant.tipo || 'Mantenimiento General'}</h4>
                      <p className="mantenimiento-descripcion">{mant.descripcion || 'Sin descripción detallada.'}</p>
                    </div>
                    <div className="mantenimiento-footer">
                      <span className="mantenimiento-costo">
                        {mant.costo ? `$${Number(mant.costo).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Costo N/A'}
                      </span>
                      <span className="mantenimiento-kilometraje">
                        {mant.kilometraje ? `${Number(mant.kilometraje).toLocaleString('es-ES')} km` : 'Km N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE INACTIVIDAD */}
      {showInactivityModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sesión cerrada</h2>
            <p>Tu sesión se ha cerrado por inactividad.<br />Serás redirigido al inicio de sesión.</p>
            <div className="modal-loader"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleVehiculo;