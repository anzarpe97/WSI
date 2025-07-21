import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheck, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/GestionMantenimiento.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../header';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import bgImage from '../../../assets/bg-login.jpg';
import { toast } from 'react-toastify';
import { verifyToken } from '../../../services/auth';

const PAGE_SIZE = 5; // Cambia este valor si quieres más o menos filas por página

const GestionMantenimiento = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [tipoReporte, setTipoReporte] = useState('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);
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

  // Verificar rol del usuario al montar
  useEffect(() => {
 const check = async () => {
    try {
      const result = await verifyToken();
      if (result.isValid && result.user) {
        // Permitir acceso a roles 0, 1 y 2
        const rol = String(result.user.rol);
        if (rol !== "0" && rol !== "1" && rol !== "2") {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
    };
    check();
  }, [navigate]);
  // --- FIN VERIFICACIÓN ROL ---

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

    // --- Temporizador de inactividad ---
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 1200000); 
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // --- Fin temporizador ---
  }, [navigate]);

  // Filtro por estado y tipo de reporte
  let mantenimientosFiltrados = mantenimientos;
  if (tipoReporte !== 'TODOS') {
    mantenimientosFiltrados = mantenimientosFiltrados.filter(m => m.estado === tipoReporte);
  } else if (filtroEstado) {
    mantenimientosFiltrados = mantenimientosFiltrados.filter(m => m.estado === filtroEstado);
  }
  // Exportar PDF
  const handleExportPDF = () => {
    let dataExport = mantenimientosFiltrados;
    let estadoLabel = 'Todos';
    if (tipoReporte === 'ACTIVO') estadoLabel = 'En Proceso';
    else if (tipoReporte === 'FINALIZADO') estadoLabel = 'Completado';
    else if (tipoReporte === 'PENDIENTE') estadoLabel = 'Pendiente';
    else if (tipoReporte === 'CANCELADO') estadoLabel = 'Cancelado';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Encabezado
    doc.setFillColor(255, 106, 0);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Mantenimientos', 40, 38);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Filtro: ${estadoLabel}   |   Total: ${dataExport.length}`, 40, 54);

    let y = 80;
    const cardSpacing = 32;
    const cardHeight = 220;
    const cardWidth = pageWidth - 80;

    dataExport.forEach((m, idx) => {
      if (y + cardHeight + 60 > pageHeight) {
        doc.addPage();
        doc.setFillColor(255, 106, 0);
        doc.rect(0, 0, pageWidth, 60, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Mantenimientos', 40, 38);
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`Filtro: ${estadoLabel}   |   Total: ${dataExport.length}`, 40, 54);
        y = 80;
      }

      // Card fondo
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(40, y, cardWidth, cardHeight, 16, 16, 'F');
      doc.setDrawColor(255, 106, 0);
      doc.setLineWidth(2);
      doc.roundedRect(40, y, cardWidth, cardHeight, 16, 16, 'S');

      // Título de la ficha
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 106, 0);
      doc.text(`N° Orden: OMT-0${m.id_mantenimiento}`, 56, y + 32);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`Estado: ${traducirEstado(m.estado)}`, 220, y + 32);

      // --- Datos en filas ---
      let rowY = y + 60;
      const rowGap = 22;
      const labelX = 56;
      const valueX = 180;
      const label2X = pageWidth / 2 + 10;
      const value2X = label2X + 110;

      // Fila 1
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Motivo:', labelX, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(String(m.id_motivo?.motivo || m.motivo || 'N/A'), valueX, rowY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Placa:', label2X, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(String(m.id_vehiculo?.placa || m.placa || 'N/A'), value2X, rowY);

      // Fila 2
      rowY += rowGap;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Tipo:', labelX, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(String(m.tipo_mantenimiento || 'N/A'), valueX, rowY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Mecánico:', label2X, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(m.id_mecanico?.nombre ? `${m.id_mecanico.nombre} ${m.id_mecanico.apellido}` : 'N/A', value2X, rowY);

      // Fila 3
      rowY += rowGap;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Fecha Programada:', labelX, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(m.fecha_programada ? new Date(m.fecha_programada).toLocaleDateString() : 'N/A', valueX, rowY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Fecha Finalizado:', label2X, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(m.fecha_finalizado ? new Date(m.fecha_finalizado).toLocaleDateString() : 'N/A', value2X, rowY);

      // Fila 4
      rowY += rowGap;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('Observaciones:', labelX, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(String(m.observaciones || 'N/A'), valueX, rowY, { maxWidth: 260 });

      // Suministros/Detalles
      rowY += rowGap + 8;
      if (m.detalles && Array.isArray(m.detalles) && m.detalles.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Suministros:', labelX, rowY);
        rowY += rowGap - 8;
        m.detalles.forEach((d, idx) => {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text(`- ${d.motivo}: ${d.cantidad} x ${d.precio_und} = ${d.total}`, labelX + 16, rowY);
          rowY += 16;
        });
      }

      y += cardHeight + cardSpacing;
    });

    // Pie de página
    const footerY = pageHeight - 30;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
      pageWidth / 2, footerY, null, null, 'center');

    doc.save('reporte_mantenimientos.pdf');
  };

  // Paginación
  const totalPaginas = Math.ceil(mantenimientosFiltrados.length / PAGE_SIZE);
  const mantenimientosPagina = mantenimientosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const handleRegistroMantenimientoClick = () => {
    navigate('/registro-mantenimiento');
  };

  // Redirige al formulario de finalización
  const handleTerminarMantenimiento = (id, estado) => {
    // Solo permite si no está finalizado
    if (estado !== 'FINALIZADO' && estado !== 'COMPLETADO') {
      navigate(`/finalizar-mantenimiento/${id}`);
    }
  };

  // Envía el id del mantenimiento seleccionado a la ruta de detalles
  const handleVerDetalles = (id) => {
    navigate(`/detalle-mantenimiento/${id}`);
  };

  const handleEliminarMantenimiento = (id) => {
    // Aquí puedes usar Swal o tu lógica de confirmación/eliminación
  };

  const traducirEstado = (estado) => {
    const estados = {
      'EN_PROCESO': 'EN PROCESO',
      'COMPLETADO': 'COMPLETADO',
      'PENDIENTE': 'PENDIENTE',
      'CANCELADO': 'CANCELADO',
      'ACTIVO': 'En Proceso',
      'FINALIZADO': 'Completado'
    };
    return estados[estado] || estado;
  };

  // Formatear el número de orden como OMT-00{id}
  const formatNumeroOrden = (id) => `OMT-0${id}`;

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

        {/* Filtros y exportar PDF */}
        <div className="mantenimiento-filtro-wrapper" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label className="mantenimiento-filtro-label" style={{ marginRight: 8, minWidth: 90 }}>Filtrar por estado:</label>
            <select value={filtroEstado} onChange={handleFiltroEstado} className="mantenimiento-filtro-select" style={{ minWidth: 150 }}>
              <option value="">Todos</option>
              <option value="ACTIVO">En Proceso</option>
              <option value="FINALIZADO">Completado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 18, flexWrap: 'wrap' }}>
            <label className="mantenimiento-filtro-label" style={{ marginRight: 8, minWidth: 60 }}>Reporte:</label>
            <select value={tipoReporte} onChange={e => setTipoReporte(e.target.value)} className="mantenimiento-filtro-select" style={{ minWidth: 150 }}>
              <option value="TODOS">Listado completo</option>
              <option value="ACTIVO">Solo en proceso</option>
              <option value="FINALIZADO">Solo completados</option>
              <option value="PENDIENTE">Solo pendientes</option>
              <option value="CANCELADO">Solo cancelados</option>
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="mantenimiento-boton-crear"
            style={{ marginLeft: 18, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, height: 40 }}
            title="Exportar listado a PDF"
          >
            <FontAwesomeIcon icon={faEye} className="mantenimiento-icono-boton" /> Exportar
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
              {mantenimientosPagina.length === 0 ? (
                <tr key="no-mantenimientos">
                  <td colSpan="6" style={{ textAlign: 'center' }}>No hay mantenimientos registrados.</td>
                </tr>
              ) : (
                mantenimientosPagina.map((mantenimiento) => {
                  const isFinalizado = 
                    mantenimiento.estado === 'FINALIZADO' || 
                    mantenimiento.estado === 'COMPLETADO';
                   
                  return (
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
                            icon={faCheck} 
                            size="lg" 
                            className={`mantenimiento-accion-icon${isFinalizado ? ' disabled' : ''}`} 
                            title={isFinalizado ? "Ya finalizado" : "Marcar como terminado"}
                            style={{
                              opacity: isFinalizado ? 0.4 : 1,
                              cursor: isFinalizado ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => !isFinalizado && handleTerminarMantenimiento(mantenimiento.id_mantenimiento, mantenimiento.estado)}
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
                  );
                })
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
              style={{
                background: '#fafafa',
                border: '1.5px solid #222',
                color: '#ff6a00',
                borderRadius: 8,
                padding: '6px 16px',
                fontWeight: 600,
                cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                opacity: paginaActual === 1 ? 0.6 : 1
              }}
            >
              Anterior
            </button>
            {[...Array(totalPaginas)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePagina(idx + 1)}
                style={{
                  background: '#fafafa',
                  border: '1.5px solid #222',
                  color: '#ff6a00',
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: paginaActual === idx + 1 ? '0 0 0 2px #ff6a00' : undefined,
                  borderColor: paginaActual === idx + 1 ? '#ff6a00' : '#222'
                }}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              style={{
                background: '#fff',
                border: '1.5px solid #222',
                color: '#ff6a00',
                borderRadius: 8,
                padding: '6px 16px',
                fontWeight: 600,
                cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                opacity: paginaActual === totalPaginas ? 0.6 : 1
              }}
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