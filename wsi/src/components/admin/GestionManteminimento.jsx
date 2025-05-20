import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../styles/GestionMantenimiento.css';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
//import Swal from 'sweetalert2';

const GestionMantenimiento = () => {
  // Datos estáticos de mantenimientos
  const [mantenimientos, setMantenimientos] = useState([
    {
      id_mantenimiento: 1,
      numero_orden: 'MT-001',
      motivo_reparacion: 'Cambio de aceite y filtros',
      placa_vehiculo: 'ABC123',
      estado: 'EN_PROCESO',
      fecha_inicio: '2023-05-15'
    },
    {
      id_mantenimiento: 2,
      numero_orden: 'MT-002',
      motivo_reparacion: 'Reparación de frenos',
      placa_vehiculo: 'XYZ789',
      estado: 'COMPLETADO',
      fecha_inicio: '2023-05-10'
    },
    {
      id_mantenimiento: 3,
      numero_orden: 'MT-003',
      motivo_reparacion: 'Alineación y balanceo',
      placa_vehiculo: 'DEF456',
      estado: 'PENDIENTE',
      fecha_inicio: '2023-05-20'
    },
    {
      id_mantenimiento: 4,
      numero_orden: 'MT-004',
      motivo_reparacion: 'Revisión general',
      placa_vehiculo: 'GHI789',
      estado: 'CANCELADO',
      fecha_inicio: '2023-05-18'
    }
  ]);

  const navigate = useNavigate();

  const handleRegistroMantenimientoClick = () => {
    navigate('/registro-mantenimiento');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-mantenimiento/${id}`);
  };

  const handleEditarMantenimiento = (id) => {
    navigate(`/editar-mantenimiento/${id}`);
  };

  const handleEliminarMantenimiento = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6a00',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setMantenimientos(mantenimientos.filter(m => m.id_mantenimiento !== id));
        Swal.fire(
          '¡Eliminado!',
          'El mantenimiento ha sido eliminado.',
          'success'
        );
      }
    });
  };

  // Función para traducir estados
  const traducirEstado = (estado) => {
    const estados = {
      'EN_PROCESO': 'EN PROCESO',
      'COMPLETADO': 'COMPLETADO',
      'PENDIENTE': 'PENDIENTE',
      'CANCELADO': 'CANCELADO'
    };
    return estados[estado] || estado;
  };

  return (
    <div className="mantenimiento-home-wrapper">
      {/* Imagen de fondo */}
      <div className="mantenimiento-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />

      {/* Contenedor principal */}
      <div className="gestion-mantenimiento-container">
        <div className="mantenimiento-titulo-container">
          <h2 className="mantenimiento-titulo">Mantenimientos Registrados</h2>
          <button
            className="mantenimiento-boton-crear"
            onClick={handleRegistroMantenimientoClick}
          >
            <FontAwesomeIcon icon={faPlus} className="mantenimiento-icono-boton" />
            Registrar Mantenimiento
          </button>
        </div>

        <div className="mantenimiento-table-responsive">
          <table className="tabla-mantenimientos">
            <thead>
              <tr>
                <th>N° Orden</th>
                <th>Motivo de Reparación</th>
                <th>Placa del Vehículo</th>
                <th>Estado</th>
                <th>Fecha de Inicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mantenimientos.length === 0 ? (
                <tr key="no-mantenimientos">
                  <td colSpan="6" style={{ textAlign: 'center' }}>No hay mantenimientos registrados.</td>
                </tr>
              ) : (
                mantenimientos.map((mantenimiento) => (
                  <tr key={mantenimiento.id_mantenimiento}>
                    <td data-label="N° Orden">{mantenimiento.numero_orden}</td>
                    <td data-label="Motivo">{mantenimiento.motivo_reparacion}</td>
                    <td data-label="Placa">{mantenimiento.placa_vehiculo}</td>
                    <td data-label="Estado">
                      <span className={`mantenimiento-estado-badge estado-${mantenimiento.estado.toLowerCase()}`}>
                        {traducirEstado(mantenimiento.estado)}
                      </span>
                    </td>
                    <td data-label="Fecha Inicio">
                      {new Date(mantenimiento.fecha_inicio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td data-label="Acciones">
                      <div className="mantenimiento-acciones">
                        <FontAwesomeIcon
                          icon={faEye}
                          size="lg"
                          className="mantenimiento-accion-icon"
                          title="Ver detalles"
                          onClick={() => handleVerDetalles(mantenimiento.id_mantenimiento)}
                        />
                        <FontAwesomeIcon 
                          icon={faPen} 
                          size="lg" 
                          className="mantenimiento-accion-icon" 
                          title="Editar mantenimiento"
                          onClick={() => handleEditarMantenimiento(mantenimiento.id_mantenimiento)}
                        />
                        <FontAwesomeIcon 
                          icon={faTrashAlt} 
                          size="lg" 
                          className="mantenimiento-accion-icon" 
                          title="Eliminar mantenimiento"
                          onClick={() => handleEliminarMantenimiento(mantenimiento.id_mantenimiento)}
                        />
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

export default GestionMantenimiento;