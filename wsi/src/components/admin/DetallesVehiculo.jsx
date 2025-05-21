import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faEdit, 
  faPrint, 
  faGasPump, 
  faWeightHanging, 
  faGauge, 
  faMoneyBill, 
  faWeight, 
  faCalendarAlt, 
  faDollarSign,
  faCar,
  faIdCard,
  faPalette,
  faCalendar,
  faCogs,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../styles/DetalleVehiculo.css';
import Header from '../header';

const DetalleVehiculo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchVehiculo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/vehiculos/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('No se pudo cargar el vehículo');
        const data = await response.json();
        setVehiculo(data);
      } catch (err) {
        setError('No se pudo cargar el vehículo');
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

  // Función mejorada para generar reporte PDF
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
    fillColor: [52, 152, 219], // azul moderno
    textColor: 255,
    fontStyle: 'bold',
    fontSize: 11
  },
  bodyStyles: {
    textColor: [33, 37, 41]
  },
  alternateRowStyles: {
    fillColor: [248, 249, 250] // gris claro moderno
  },
  margin: { top: 85 },
  tableLineColor: [230, 230, 230],
  tableLineWidth: 0.3,
  columnStyles: {
    0: { cellWidth: 70, fontStyle: 'bold', textColor: [44, 62, 80] }, // columna izquierda
    1: { cellWidth: 120 } // columna derecha
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

  if (loading) return <div className="loader">Cargando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!vehiculo) return null;

  return (
    <div className="detalle-vehiculo-container" ref={reportRef}>
      <Header 
        title="WSI"
        showBackButton={true}
        customIconSize="1.8rem"
      />
      
      <div className="detalle-vehiculo-content">
        <div className="detalle-vehiculo-header">
          <h2 className="detalle-vehiculo-titulo">
            <FontAwesomeIcon icon={faCar} /> {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
          </h2>
          <div className="detalle-vehiculo-acciones">
            <button className="detalle-vehiculo-btn imprimir" title="Generar PDF" onClick={handleGenerarReporte}>
              <FontAwesomeIcon icon={faPrint} /> PDF
            </button>
            <button className="detalle-vehiculo-btn editar" title="Editar" onClick={handleEditar}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button className="detalle-vehiculo-btn volver" title="Volver" onClick={handleVolver}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
        </div>

        <div className="detalle-vehiculo-card">
          <div className="detalle-vehiculo-imagen">
            <div className="detalle-vehiculo-imagen-placeholder">
              <span>{vehiculo.marca?.charAt(0)}{vehiculo.modelo?.charAt(0)}</span>
            </div>
          </div>
          
          <div className="detalle-vehiculo-info">
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faIdCard} className="icono-info" />
              <span className="detalle-vehiculo-label">Estado:</span>
              <span className={`detalle-vehiculo-value estado ${vehiculo.estado?.toLowerCase()}`}>
                {formatEstado(vehiculo.estado)}
              </span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faPalette} className="icono-info" />
              <span className="detalle-vehiculo-label">Color:</span>
              <span className="detalle-vehiculo-value">
                <span 
                  className="detalle-vehiculo-color-indicator" 
                  style={{ backgroundColor: getColorCode(vehiculo.color) }}
                ></span>
                {vehiculo.color}
              </span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faCalendar} className="icono-info" />
              <span className="detalle-vehiculo-label">Año:</span>
              <span className="detalle-vehiculo-value">{vehiculo.anio}</span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faCogs} className="icono-info" />
              <span className="detalle-vehiculo-label">Tipología:</span>
              <span className="detalle-vehiculo-value">{vehiculo.tipologia}</span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faChartLine} className="icono-info" />
              <span className="detalle-vehiculo-label">Motor:</span>
              <span className="detalle-vehiculo-value">{vehiculo.motor}</span>
            </div>
          </div>
        </div>

        <div className="detalle-vehiculo-seccion">
          <h3 className="detalle-vehiculo-subtitulo">
            <FontAwesomeIcon icon={faWeight} className="icono-seccion" />
            Especificaciones Técnicas
          </h3>
          <div className="detalle-vehiculo-info-adicional">
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faWeightHanging} className="icono-info" />
              <span className="detalle-vehiculo-label">Capacidad de carga:</span>
              <span className="detalle-vehiculo-value">{vehiculo.capacidad_carga} kg</span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faGasPump} className="icono-info" />
              <span className="detalle-vehiculo-label">Combustible:</span>
              <span className="detalle-vehiculo-value">
                {vehiculo.tipo_combustible} ({vehiculo.capacidad_combustible} L)
              </span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faGauge} className="icono-info" />
              <span className="detalle-vehiculo-label">Kilometraje:</span>
              <span className="detalle-vehiculo-value">{vehiculo.kilometraje?.toLocaleString()} km</span>
            </div>
          </div>
        </div>

        <div className="detalle-vehiculo-seccion">
          <h3 className="detalle-vehiculo-subtitulo">
            <FontAwesomeIcon icon={faDollarSign} className="icono-seccion" />
            Información Financiera
          </h3>
          <div className="detalle-vehiculo-info-adicional">
            <div className="detalle-vehiculo-info-row">
              <FontAwesomeIcon icon={faMoneyBill} className="icono-info" />
              <span className="detalle-vehiculo-label">Costo:</span>
              <span className="detalle-vehiculo-value">
                ${vehiculo.costo?.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
          </div>
        </div>

        <div className="detalle-vehiculo-seccion">
          <h3 className="detalle-vehiculo-subtitulo">
            <FontAwesomeIcon icon={faCalendarAlt} className="icono-seccion" />
            Registro del Vehículo
          </h3>
          <div className="detalle-vehiculo-info-adicional">
            <div className="detalle-vehiculo-info-row">
              <span className="detalle-vehiculo-label">Fecha de creación:</span>
              <span className="detalle-vehiculo-value">{formatFecha(vehiculo.fecha_creado)}</span>
            </div>
          </div>
        </div>
      </div>
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