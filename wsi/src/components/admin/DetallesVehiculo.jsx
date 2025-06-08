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
import Header from '../header';
import { verifyToken } from '../../services/auth';
import '../../styles/DetalleVehiculo.css';

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
      try {
        // Obtener vehículo
        const response = await fetch(`http://localhost:8000/api/vehiculos/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('No se pudo cargar el vehículo');
        const data = await response.json();
        setVehiculo(data);

        // Mantenimientos de ejemplo
        setMantenimientos([
          {
            id: 1,
            tipo: 'Cambio de aceite',
            fecha: '2023-10-15T14:30:00Z',
            costo: 120.50,
            descripcion: 'Cambio de aceite y filtro',
            kilometraje: 15000
          },
          {
            id: 2,
            tipo: 'Rotación de neumáticos',
            fecha: '2023-08-22T10:15:00Z',
            costo: 80.00,
            descripcion: 'Rotación y balanceo de neumáticos',
            kilometraje: 12000
          },
          {
            id: 3,
            tipo: 'Revisión general',
            fecha: '2023-05-10T09:00:00Z',
            costo: 200.00,
            descripcion: 'Revisión completa del vehículo',
            kilometraje: 8000
          }
        ]);
      } catch (err) {
        setError('No se pudo cargar la información completa');
      } finally {
        setLoading(false);
      }
    };
    fetchVehiculo();
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleEditar = () => {
    navigate(`/editar-vehiculo/${vehiculo.id_vehiculo}`);
  };

  const handleGenerarReporte = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Logo y encabezado
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Vehículo', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

    // Información principal
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(`${vehiculo.marca} ${vehiculo.modelo}`, 20, 45);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Placa: ${vehiculo.placa}`, 20, 55);
    doc.text(`Año: ${vehiculo.anio}`, 20, 60);
    doc.text(`Color: ${vehiculo.color}`, 20, 65);
    doc.text(`Estado: ${formatEstado(vehiculo.estado)}`, 20, 70);

    // Tabla de especificaciones
    autoTable(doc, {
      startY: 80,
      head: [['Especificación', 'Detalle']],
      body: [
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
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 6,
        valign: 'middle',
        lineColor: [220, 220, 220],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        textColor: [33, 37, 41]
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { top: 85 },
      tableLineColor: [230, 230, 230],
      tableLineWidth: 0.3,
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold', textColor: [44, 62, 80] },
        1: { cellWidth: 120 }
      }
    });

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('© WSI - Sistema de Gestión de Vehículos', 105, 285, { align: 'center' });

    doc.save(`Reporte_Vehiculo_${vehiculo.placa}.pdf`);
  };

  const formatEstado = (estado) => {
    if (!estado) return 'N/A';
    return estado === "EN_MANTENIMIENTO" ? "MANTENIMIENTO" : estado;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFechaHora = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loader">Cargando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!vehiculo) return null;

  return (
    <div className="vehiculo-home-wrapper">
      <Header title="WSI" />

      <div className="detalle-vehiculo-container" ref={reportRef}>
        <div className="detalle-vehiculo-card">
          <div className="detalle-vehiculo-header">
            <h2 className="detalle-vehiculo-titulo">Detalles del Vehículo</h2>
            <div className="detalle-vehiculo-acciones">
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
                  <span className={`info-value estado ${vehiculo.estado?.toLowerCase()}`}>
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
                    {vehiculo.color}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Año:</span>
                  <span className="info-value">{vehiculo.anio}</span>
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
                  <span className="info-label">Capacidad:</span>
                  <span className="info-value">{vehiculo.capacidad_carga} kg</span>
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
                  <span className="info-label">Capacidad:</span>
                  <span className="info-value">{vehiculo.capacidad_combustible} L</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Kilometraje:</span>
                  <span className="info-value">{vehiculo.kilometraje?.toLocaleString()} km</span>
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
                    ${vehiculo.costo?.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Fecha:</span>
                  <span className="info-value">{formatFecha(vehiculo.fecha_creado)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Mantenimientos */}
          <div className="mantenimientos-section">
            <h3 className="section-title">
              <FontAwesomeIcon icon={faTools} /> Últimos Mantenimientos
            </h3>
            
            {mantenimientos.length === 0 ? (
              <div className="no-mantenimientos">
                <FontAwesomeIcon icon={faFileAlt} size="2x" />
                <p>Este vehículo no tiene mantenimientos registrados.</p>
              </div>
            ) : (
              <div className="mantenimientos-grid">
                {mantenimientos.map(mant => (
                  <div className="mantenimiento-card" key={mant.id}>
                    <div className="mantenimiento-header">
                      <span className="mantenimiento-fecha">{formatFechaHora(mant.fecha)}</span>
                      <span className={`mantenimiento-estado ${mant.estado?.toLowerCase() || 'completado'}`}>
                        {mant.estado || 'COMPLETADO'}
                      </span>
                    </div>
                    <div className="mantenimiento-body">
                      <h4 className="mantenimiento-titulo">{mant.tipo}</h4>
                      <p className="mantenimiento-descripcion">{mant.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="mantenimiento-footer">
                      <span className="mantenimiento-costo">
                        ${mant.costo?.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                      <span className="mantenimiento-kilometraje">
                        {mant.kilometraje} km
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

const getColorCode = (colorName) => {
  const colors = {
    'blanco': '#ffffff',
    'rojo': '#ff0000',
    'azul': '#0000ff',
    'negro': '#000000',
    'gris': '#808080',
    'verde': '#008000',
    'amarillo': '#ffff00',
    'plateado': '#c0c0c0'
  };
  return colors[colorName?.toLowerCase()] || '#cccccc';
};

export default DetalleVehiculo;