import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../styles/GestionMantenimiento.css';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';

const PAGE_SIZE = 5; // Cambia este valor si quieres más o menos filas por página

const GestionMantenimiento = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMantenimientos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/mantenimientos/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setMantenimientos(data);
      } catch (error) {
        setMantenimientos([]);
      }
    };
    fetchMantenimientos();
  }, []);

  // Filtro por estado
  const mantenimientosFiltrados = filtroEstado
    ? mantenimientos.filter(m => m.estado === filtroEstado)
    : mantenimientos;

  // Paginación
  const totalPaginas = Math.ceil(mantenimientosFiltrados.length / PAGE_SIZE);
  const mantenimientosPagina = mantenimientosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

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
    // Aquí puedes usar Swal o tu lógica de confirmación/eliminación
  };

  const traducirEstado = (estado) => {
    const estados = {
      'EN_PROCESO': 'EN PROCESO',
      'COMPLETADO': 'COMPLETADO',
      'PENDIENTE': 'PENDIENTE',
      'CANCELADO': 'CANCELADO'
    };
    return estados[estado] || estado;
  };

  // Formatear el número de orden como OMT-00{id}
  const formatNumeroOrden = (id) => `OMT-00${id}`;

  // Cambiar de página
  const handlePagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Cambiar filtro y resetear página
  const handleFiltroEstado = (e) => {
    setFiltroEstado(e.target.value);
    setPaginaActual(1);
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

        {/* Filtros */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8 }}>Filtrar por estado:</label>
          <select value={filtroEstado} onChange={handleFiltroEstado}  className="mantenimiento-filtro-select" >
            <option value="">Todos</option>
            <option value="ACTIVO">En Proceso</option>
            <option value="FINALIZADO">Completado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
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
              {mantenimientosPagina.length === 0 ? (
                <tr key="no-mantenimientos">
                  <td colSpan="6" style={{ textAlign: 'center' }}>No hay mantenimientos registrados.</td>
                </tr>
              ) : (
                mantenimientosPagina.map((mantenimiento) => (
                  <tr key={mantenimiento.id_mantenimiento}>
                    <td data-label="N° Orden">{formatNumeroOrden(mantenimiento.id_mantenimiento)}</td>
                    <td data-label="Motivo">
                      {mantenimiento.id_motivo?.motivo || mantenimiento.motivo || 'N/A'}
                    </td>
                    <td data-label="Placa">
                      {mantenimiento.id_vehiculo?.placa || mantenimiento.placa || 'N/A'}
                    </td>
                    <td data-label="Estado">
                      <span className={`mantenimiento-estado-badge estado-${mantenimiento.estado?.toLowerCase()}`}>
                        {traducirEstado(mantenimiento.estado)}
                      </span>
                    </td>
                    <td data-label="Fecha Inicio">
                      {new Date(mantenimiento.fecha_programada || mantenimiento.fecha_inicio).toLocaleDateString('es-ES', {
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

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button
              onClick={() => handlePagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>
            {[...Array(totalPaginas)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePagina(idx + 1)}
                style={{
                  fontWeight: paginaActual === idx + 1 ? 'bold' : 'normal',
                  background: paginaActual === idx + 1 ? '#ff6a00' : undefined,
                  color: paginaActual === idx + 1 ? '#fff' : undefined
                }}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionMantenimiento;