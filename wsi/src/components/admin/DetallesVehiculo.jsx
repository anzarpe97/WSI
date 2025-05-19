import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faPrint, faGasPump, faWeightHanging, faGauge, faMoneyBill, faWeight, faCalendarAlt, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import '../../styles/DetalleVehiculo.css';
import Header from '../header';

const DetalleVehiculo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="loader">Cargando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!vehiculo) return null;
  
  console.log('Vehiculo recibido:', vehiculo); 
  console.log('Fecha recibida:', vehiculo.fecha_creado);
  // Validación para evitar "Invalid Date"
  const fechaCreacion = vehiculo.fecha_creado
    ? new Date(vehiculo.fecha_creado).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Sin registro';

  return (
    <div id="detalle-vehiculo-container">
      <Header 
        title="WSI"
        showBackButton={true}
        customIconSize="1.8rem"
      />
      
      <div className="detalle-vehiculo-content">
        <div className="detalle-vehiculo-header">
          <h2 className="detalle-vehiculo-titulo">
            {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
          </h2>
          <div className="detalle-vehiculo-acciones">
            <button className="detalle-vehiculo-btn imprimir" title="Imprimir">
              <FontAwesomeIcon icon={faPrint} />
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
              <span className="detalle-vehiculo-label">Estado:</span>
              <span className={`detalle-vehiculo-value estado ${vehiculo.estado?.toLowerCase()}`}>
                {vehiculo.estado === "EN_MANTENIMIENTO" ? "MANTENIMIENTO" : vehiculo.estado}
              </span>
            </div>
            <div className="detalle-vehiculo-info-row">
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
              <span className="detalle-vehiculo-label">Año:</span>
              <span className="detalle-vehiculo-value">{vehiculo.anio}</span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <span className="detalle-vehiculo-label">Tipología:</span>
              <span className="detalle-vehiculo-value">{vehiculo.tipologia}</span>
            </div>
            <div className="detalle-vehiculo-info-row">
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
              <FontAwesomeIcon icon={faWeightHanging}  className="icono-info"/>
              <span className="detalle-vehiculo-label">Capacidad de carga:</span>
              <span className="detalle-vehiculo-value">{vehiculo.capacidad_carga} kg</span>
            </div>
            <div className="detalle-vehiculo-info-row">
              <span className="detalle-vehiculo-label">
                <FontAwesomeIcon icon={faGasPump} className="icono-info" />
                Combustible:
              </span>
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
              <span className="detalle-vehiculo-value">{fechaCreacion}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para colores
const getColorCode = (colorName) => {
  const colors = {
    'blanco': '#ffffff',
    'rojo': '#ff0000',
    'azul': '#0000ff',
    'negro': '#000000',
    'gris': '#808080'
  };
  return colors[colorName?.toLowerCase()] || '#cccccc';
};

export default DetalleVehiculo;