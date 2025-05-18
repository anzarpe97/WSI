import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faPen,
  faTrashAlt, // Icono de eliminación
  faBell,
  faUser,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/VerOrdenes.css'; // Archivo CSS para los estilos
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate

const VerOrdenes = () => {
  console.log('🔸 VerOrdenes renderizado');

  const navigate = useNavigate(); // Usamos useNavigate para redirecciones

  // Función para redirigir al registro de mantenimiento
  const handleRegistroMantenimientoClick = () => {
    navigate('/registro-mantenimiento'); // Redirige a /registro-mantenimiento
  };

  // Datos simulados de órdenes de mantenimiento
  const ordenesMantenimiento = [
    { id: 1, numOrden: 'ORD-001', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 2, numOrden: 'ORD-002', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 3, numOrden: 'ORD-003', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 4, numOrden: 'ORD-004', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 5, numOrden: 'ORD-005', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 6, numOrden: 'ORD-006', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 7, numOrden: 'ORD-007', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
    { id: 8, numOrden: 'ORD-008', motivo: 'Cambio de aceite y filtro aceite', placaVehiculo: 'A17BN1E' },
  ];

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="registro-header">
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h1>WSI</h1>
        <div className="header-icons">
          <FontAwesomeIcon icon={faBell} size="lg" className="header-icon" />
          <FontAwesomeIcon icon={faUser} size="lg" className="header-icon" />
          <FontAwesomeIcon icon={faSignOutAlt} size="lg" className="header-icon" />
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="ver-ordenes-container">
        <h2 className="titulo">Órdenes de Mantenimiento</h2>

        {/* Botón para crear mantenimiento */}
        <button
          className="boton-crear-mantenimiento"
          onClick={handleRegistroMantenimientoClick}
          style={{ cursor: 'pointer' }}
        >
          Crear Mantenimiento
        </button>

        {/* Tabla de órdenes */}
        <table className="tabla-ordenes">
          <thead>
            <tr>
              <th>Num Orden</th>
              <th>Motivo</th>
              <th>Vehículo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesMantenimiento.map((orden) => (
              <tr key={orden.id}>
                <td>{orden.numOrden}</td>
                <td>{orden.motivo}</td>
                <td>{orden.placaVehiculo}</td>
                <td>
                  <div className="acciones">
                    <FontAwesomeIcon
                      icon={faEye}
                      size="lg"
                      className="accion-icon"
                      title="Ver detalles"
                    />
                    <FontAwesomeIcon
                      icon={faPen}
                      size="lg"
                      className="accion-icon"
                      title="Editar orden"
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      size="lg"
                      className="accion-icon"
                      title="Eliminar orden"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerOrdenes;