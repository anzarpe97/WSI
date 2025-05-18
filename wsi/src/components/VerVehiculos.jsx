import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../styles/VerVehiculos.css';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg-login.jpg';
import { verifyToken } from '../services/auth';
import { getVehiculos } from '../services/vehiculos';

const VerVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "WSI - Vehículos";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (!result.isValid) {
          navigate('/login');
          return;
        }
        // Si el token es válido, carga los vehículos
        const data = await getVehiculos();
        setVehiculos(data);
      } catch (error) {
        setError('No se pudieron cargar los vehículos');
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [navigate]);

  const handleRegistroVehiculoClick = () => {
    navigate('/registro-vehiculo');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-vehiculo/${id}`);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      {/* Imagen de fondo */}
      <div className="vehiculos-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />

      {/* Contenedor principal */}
      <div className="ver-vehiculos-container">
        <div className="titulo-container">
          <h2 className="titulo">Vehículos Registrados</h2>
          <button
            className="boton-crear-vehiculo"
            onClick={handleRegistroVehiculoClick}
          >
            <FontAwesomeIcon icon={faPlus} className="icono-boton" />
            Registrar Vehículo
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="table-responsive">
          <table className="tabla-vehiculos">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No hay vehículos registrados.</td>
                </tr>
              ) : (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td data-label="Placa">{vehiculo.placa}</td>
                    <td data-label="Marca">{vehiculo.marca}</td>
                    <td data-label="Modelo">{vehiculo.modelo}</td>
                    <td data-label="Color">{vehiculo.color}</td>
                    <td data-label="Estado">
                      {vehiculo.estado === "EN_MANTENIMIENTO" ? (
                        <span className="estado-badge estado-mantenimiento">
                          MANTENIMIENTO
                        </span>
                      ) : (
                        <span className={`estado-badge estado-${vehiculo.estado?.toLowerCase().replace(' ', '-')}`}>
                          {vehiculo.estado}
                        </span>
                      )}
                    </td>
                    <td data-label="Acciones">
                      <div className="acciones">
                        <FontAwesomeIcon
                          icon={faEye}
                          size="lg"
                          className="accion-icon"
                          title="Ver detalles"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleVerDetalles(vehiculo.id)}
                        />
                        <FontAwesomeIcon icon={faPen} size="lg" className="accion-icon" title="Editar vehículo"/>
                        <FontAwesomeIcon icon={faTrashAlt} size="lg" className="accion-icon" title="Eliminar vehículo"/>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerVehiculos;