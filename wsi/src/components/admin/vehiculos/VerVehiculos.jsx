import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/VerVehiculos.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../header';
import bgImage from '../../../assets/bg-login.jpg';
import { verifyToken } from '../../../services/auth';
import { getVehiculos } from '../../../services/vehiculos';
import { toast } from 'react-toastify';

const PAGE_SIZE = 5;

const VerVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [tipoReporte, setTipoReporte] = useState('TODOS');
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [userRol, setUserRol] = useState(null);
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  // Logout y temporizador de inactividad
  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  useEffect(() => {
    document.title = "WSI - Vehículos";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          setUserRol(String(result.user.rol)); // Guardar el rol del usuario
          // Permitir roles 0 (admin), 1 (supervisor) y 2 (usuario)
          if (
            String(result.user.rol) !== "0" &&
            String(result.user.rol) !== "1" &&
            String(result.user.rol) !== "2"
          ) {
            logout();
            return;
          }
        } else {
          logout();
          return;
        }
        const data = await getVehiculos();
        setVehiculos(data);
      } catch (error) {
        setError('No se pudieron cargar los vehículos');
      } finally {
        setLoading(false);
      }
    };
    check();

    // --- Temporizador de inactividad ---
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 1200000); // 20 minutos
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // --- Fin temporizador ---
  }, [navigate]);

  // Filtros
  const vehiculosFiltrados = vehiculos.filter((v) => {
    const coincideEstado = filtroEstado ? v.estado === filtroEstado : true;
    const coincidePlaca = filtroPlaca ? v.placa.toLowerCase().includes(filtroPlaca.toLowerCase()) : true;
    const noEstaBorrado = !v.borrado; // Filter out vehicles where borrado is true
    return coincideEstado && coincidePlaca && noEstaBorrado;
  });


const handleExportPDF = () => {
  let dataExport = vehiculosFiltrados;
  let estadoLabel = 'Todos';
  if (tipoReporte === 'ACTIVOS') {
    dataExport = vehiculosFiltrados.filter(v => v.estado === 'ACTIVO');
    estadoLabel = 'Activos';
  } else if (tipoReporte === 'INACTIVOS') {
    dataExport = vehiculosFiltrados.filter(v => v.estado === 'INACTIVO');
    estadoLabel = 'Inactivos';
  } else if (tipoReporte === 'MANTENIMIENTO') {
    dataExport = vehiculosFiltrados.filter(v => v.estado === 'EN_MANTENIMIENTO');
    estadoLabel = 'En Mantenimiento';
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Encabezado general
  doc.setFillColor(255, 106, 0); // Naranja principal
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Vehículos', 40, 38);
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Filtro: ${estadoLabel}   |   Total: ${dataExport.length}`, 40, 54);


  let y = 80;
  const cardSpacing = 32;
  const cardHeight = 210; // Más alto para evitar solapamiento
  const cardWidth = pageWidth - 80;

  dataExport.forEach((v, idx) => {
    if (y + cardHeight + 60 > pageHeight) {
      doc.addPage();
      // Redibujar encabezado en cada página
      doc.setFillColor(255, 106, 0);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Vehículos', 40, 38);
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(`Filtro: ${estadoLabel}   |   Total: ${dataExport.length}`, 40, 54);
      y = 80;
    }

    // Card fondo
    doc.setFillColor(250, 250, 250); // Fondo claro
    doc.roundedRect(40, y, cardWidth, cardHeight, 16, 16, 'F');
    // Borde naranja
    doc.setDrawColor(255, 106, 0);
    doc.setLineWidth(2);
    doc.roundedRect(40, y, cardWidth, cardHeight, 16, 16, 'S');

    // Título de la ficha
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 106, 0);
    doc.text(`Placa: ${v.placa}`, 56, y + 32);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Estado: ${v.estado === 'EN_MANTENIMIENTO' ? 'MANTENIMIENTO' : v.estado}`, 220, y + 32);

    // --- Datos en filas, no columnas ---
    let rowY = y + 60;
    const rowGap = 22;
    const labelX = 56;
    const valueX = 160;
    const label2X = pageWidth / 2 + 10;
    const value2X = label2X + 110;

    // Fila 1
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Marca:', labelX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.marca ?? ''), valueX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Kilometraje:', label2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.kilometraje ?? ''), value2X, rowY);

    // Fila 2
    rowY += rowGap;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Modelo:', labelX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.modelo ?? ''), valueX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Motor:', label2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.motor ?? ''), value2X, rowY);

    // Fila 3
    rowY += rowGap;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Color:', labelX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.color ?? ''), valueX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Cap. Carga:', label2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${v.capacidad_carga ?? ''} kg`, value2X, rowY);

    // Fila 4
    rowY += rowGap;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Año:', labelX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.anio || v.año || ''), valueX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Cap. Combustible:', label2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${v.capacidad_combustible ?? ''} L`, value2X, rowY);

    // Fila 5
    rowY += rowGap;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Tipología:', labelX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.tipologia ?? ''), valueX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Combustible:', label2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.tipo_combustible ?? ''), value2X, rowY);

    // Fila 6
    rowY += rowGap;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Costo:', labelX, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(String(v.costo ?? ''), valueX, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.text('Fecha Registro:', label2X, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(v.fecha_creado ? new Date(v.fecha_creado).toLocaleDateString() : '', value2X, rowY);

    y += cardHeight + cardSpacing;
  });

  // Pie de página
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
    pageWidth / 2, footerY, null, null, 'center');

  doc.save('reporte_vehiculos.pdf');
};


  // Paginación
  const totalPaginas = Math.ceil(vehiculosFiltrados.length / PAGE_SIZE);
  const vehiculosPagina = vehiculosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const handleRegistroVehiculoClick = () => {
    navigate('/registro-vehiculo');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-vehiculo/${id}`);
  };

  const handlePagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleOpenDeleteModal = (vehiculo) => {
    setVehicleToDelete(vehiculo);
    setShowDeleteModal(true);
    setDeleteReason(''); // Reset reason
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete || !deleteReason.trim()) {
      alert("Por favor, ingrese un motivo para la eliminación.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/vehiculos/${vehicleToDelete.id_vehiculo}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          borrado: true,
          motivo_borrado: deleteReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error al actualizar el vehículo." }));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      setVehiculos(prevVehiculos =>
        prevVehiculos.map(v =>
          v.id_vehiculo === vehicleToDelete.id_vehiculo ? { ...v, borrado: true, motivo_borrado: deleteReason } : v
        )
      );

      handleCloseDeleteModal();
    } catch (error) {
      alert(`Error al eliminar el vehículo: ${error.message}`);
    }
  };

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroPlaca]);

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
          {userRol === "0" || userRol === "1" ? (
            <button
              className="boton-crear-vehiculo"
              onClick={handleRegistroVehiculoClick}
            >
              <FontAwesomeIcon icon={faPlus} className="icono-boton" />
              Registrar Vehículo
            </button>
          ) : null}
        </div>

        {/* Filtros y exportar PDF */}
        <div className="filtros-container">
          <div className="filtro-item">
            <label>Estado:</label>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="mantenimiento-filtro-select"
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
            </select>
          </div>
          
          <div className="filtro-item">
            <label>Placa:</label>
            <input
              type="text"
              placeholder="Buscar placa..."
              value={filtroPlaca}
              onChange={e => setFiltroPlaca(e.target.value)}
              className="filtro-placa-input"
            />
          </div>
          
          <div className="filtro-item">
            <label>Reporte:</label>
            <select
              value={tipoReporte}
              onChange={e => setTipoReporte(e.target.value)}
              className="mantenimiento-filtro-select"
            >
              <option value="TODOS">Listado completo</option>
              <option value="ACTIVOS">Solo activos</option>
              <option value="INACTIVOS">Solo inactivos</option>
              <option value="MANTENIMIENTO">Solo en mantenimiento</option>
            </select>
          </div>
          
          <button
            onClick={handleExportPDF}
            className="exportar-pdf-btn"
            title="Exportar listado a PDF"
          >
            <FontAwesomeIcon icon={faEye} className="exportar-icon" /> Exportar
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

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
              {vehiculosPagina.length === 0 ? (
                <tr key="no-vehiculos">
                  <td colSpan="6" className="no-vehiculos">No hay vehículos registrados.</td>
                </tr>
              ) : (
                vehiculosPagina.map((vehiculo) => (
                  <tr key={vehiculo.id_vehiculo}>
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
                        {/* Ver detalles: todos los roles */}
                        <FontAwesomeIcon
                          icon={faEye}
                          size="lg"
                          className="accion-icon"
                          title="Ver detalles"
                          onClick={() => handleVerDetalles(vehiculo.id_vehiculo)}
                        />
                        {/* Editar: solo admin (0) y supervisor (1) */}
                        {(userRol === "0" || userRol === "1") && (
                          <FontAwesomeIcon
                            icon={faPen}
                            size="lg"
                            className="accion-icon"
                            title="Editar vehículo"
                            onClick={() => navigate(`/editar-vehiculo/${vehiculo.id_vehiculo}`)}
                          />
                        )}
                        {/* Eliminar: solo admin (0) */}
                        {userRol === "0" && (
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            size="lg"
                            className="accion-icon"
                            onClick={() => handleOpenDeleteModal(vehiculo)}
                            title="Eliminar Vehículo"
                          />
                        )}
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
          <div className="paginacion-container">
            <button
              onClick={() => handlePagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={`paginacion-btn ${paginaActual === 1 ? 'disabled' : ''}`}
            >
              Anterior
            </button>
            <div className="paginacion-numeros">
              {[...Array(totalPaginas)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => handlePagina(idx + 1)}
                  className={`paginacion-numero ${paginaActual === idx + 1 ? 'active' : ''}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className={`paginacion-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && vehicleToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Eliminación</h2>
            <p>
              ¿Está seguro de que desea eliminar el vehículo <strong>{vehicleToDelete.placa}</strong>?
            </p>
            <div className="form-group">
              <label htmlFor="deleteReason">Motivo de la eliminación:</label>
              <textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows="3"
                placeholder="Ingrese el motivo..."
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleConfirmDelete} className="btn btn-confirmar">Aceptar</button>
              <button onClick={handleCloseDeleteModal} className="btn btn-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerVehiculos;