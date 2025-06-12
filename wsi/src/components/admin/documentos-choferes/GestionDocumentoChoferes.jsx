// GestionDocumentoChoferes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/GestionDocumentoChoferes.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../header';
import bgImage from '../../../assets/bg-login.jpg';
import { toast } from 'react-toastify';
import { verifyToken } from '../../../services/auth';

const PAGE_SIZE = 5;

const GestionDocumentoChoferes = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
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
    const fetchDocumentos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/documentos-choferes-verificar/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setDocumentos(data);
      } catch (error) {
        setDocumentos([]);
      }
    };
    fetchDocumentos();

    // Temporizador de inactividad
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
  }, [navigate]);

  // Filtro por estado
  const documentosFiltrados = filtroEstado
    ? documentos.filter(d => d.estado === filtroEstado)
    : documentos;

  // Paginación
  const totalPaginas = Math.ceil(documentosFiltrados.length / PAGE_SIZE);
  const documentosPagina = documentosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const handleRegistroDocumentoClick = () => {
    navigate('/registro-documentos-choferes');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-documento-chofer/${id}`);
  };

  const handleEditarDocumento = (id) => {
    navigate(`/editar-documento-chofer/${id}`);
  };

  const handleEliminarDocumento = (id) => {
    // Lógica de confirmación/eliminación
  };

  const traducirEstado = (estado) => {
    const estados = {
      'VIGENTE': 'Vigente',
      'VENCIDO': 'Vencido',
      'PROXIMO_VENCER': 'Próximo a vencer',
    };
    return estados[estado] || estado;
  };

  const traducirTipoDocumento = (tipo) => {
    const tipos = {
      'CEDULA_IDENTIDAD': 'Cédula de Identidad',
      'LICENCIA_CONDUCIR': 'Licencia de Conducir',
      'CARTA_MEDICA': 'Carta Médica',
    };
    return tipos[tipo] || tipo;
  };

  // Formatear el ID del documento
  const formatIdDocumento = (id) => `DOC-00${id}`;

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

  // Calcular días restantes para documentos próximos a vencer
  const calcularDiasRestantes = (fechaCaducidad) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaCaducidad);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calcular estado del documento
  const calcularEstado = (fechaCaducidad) => {
    const diasRestantes = calcularDiasRestantes(fechaCaducidad);
    if (diasRestantes < 0) return 'VENCIDO';
    if (diasRestantes <= 30) return 'PROXIMO_VENCER';
    return 'VIGENTE';
  };

  return (
    <div className="documento-chofer-home-wrapper">
      {/* Imagen de fondo */}
      <div className="documento-chofer-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />

      {/* Contenedor principal */}
      <div className="gestion-documento-chofer-container">
        <div className="documento-chofer-titulo-container">
          <h2 className="documento-chofer-titulo">
            <FontAwesomeIcon icon={faFileAlt} className="documento-chofer-icono-titulo" />
            Documentos de Choferes
          </h2>
          <button
            className="documento-chofer-boton-crear"
            onClick={handleRegistroDocumentoClick}
          >
            <FontAwesomeIcon icon={faPlus} className="documento-chofer-icono-boton" />
            Registrar Documento
          </button>
        </div>

        {/* Filtros */}
        <div className="documento-chofer-filtros-container">
          <div className="documento-chofer-filtro">
            <label>Filtrar por estado:</label>
            <select value={filtroEstado} onChange={handleFiltroEstado} className="documento-chofer-filtro-select" >
              <option value="">Todos</option>
              <option value="VIGENTE">Vigente</option>
              <option value="PROXIMO_VENCER">Próximo a vencer</option>
              <option value="VENCIDO">Vencido</option>
            </select>
          </div>
        </div>

        <div className="documento-chofer-table-responsive">
          <table className="tabla-documentos-choferes">
            <thead>
              <tr>
                <th>ID Documento</th>
                <th>Chofer</th>
                <th>Tipo de Documento</th>
                <th>Número</th>
                <th>Fecha Caducidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentosPagina.length === 0 ? (
                <tr key="no-documentos">
                  <td colSpan="7" className="documento-chofer-sin-registros">
                    <FontAwesomeIcon icon={faFileAlt} className="documento-chofer-icono-vacio" />
                    No hay documentos registrados.
                  </td>
                </tr>
              ) : (
                documentosPagina.map((documento) => {
                  const estado = calcularEstado(documento.fecha_caducidad);
                  return (
                    <tr key={documento.id_documento_chofer}>
                      <td data-label="ID Documento">{formatIdDocumento(documento.id_documento_chofer)}</td>
                      <td data-label="Chofer">
                        <div className="documento-chofer-info-chofer">
                          <div className="documento-chofer-avatar">
                            {documento.chofer_nombre?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="documento-chofer-nombre">{documento.chofer_nombre || 'N/A'}</div>
                            <div className="documento-chofer-licencia">{documento.chofer_apellido || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Tipo Documento">
                        {traducirTipoDocumento(documento.tipo_documento)}
                      </td>
                      <td data-label="Número">
                        {documento.numero_documento}
                      </td>
                      <td data-label="Fecha Caducidad">
                        {documento.fecha_caducidad ? new Date(documento.fecha_caducidad).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'N/A'}
                        {estado === 'PROXIMO_VENCER' && documento.fecha_caducidad && (
                          <div className="documento-chofer-alerta">
                            {calcularDiasRestantes(documento.fecha_caducidad)} días
                          </div>
                        )}
                      </td>
                      <td data-label="Estado">
                        <span className={`documento-chofer-estado-badge estado-${estado.toLowerCase()}`}>
                          {traducirEstado(estado)}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="documento-chofer-acciones">
                          <button 
                            className="documento-chofer-accion-btn"
                            onClick={() => handleVerDetalles(documento.id_documento_chofer)}
                            title="Ver detalles"
                          >
                            <FontAwesomeIcon icon={faEye} size="lg" />
                          </button>
                          <button 
                            className="documento-chofer-accion-btn"
                            onClick={() => handleEditarDocumento(documento.id_documento_chofer)}
                            title="Editar documento"
                          >
                            <FontAwesomeIcon icon={faPen} size="lg" />
                          </button>
                          <button 
                            className="documento-chofer-accion-btn"
                            onClick={() => handleEliminarDocumento(documento.id_documento_chofer)}
                            title="Eliminar documento"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="documento-chofer-paginacion">
            <button
              onClick={() => handlePagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="documento-chofer-pagina-btn documento-chofer-pagina-prev"
            >
              Anterior
            </button>
            {[...Array(totalPaginas)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePagina(idx + 1)}
                className={`documento-chofer-pagina-btn ${paginaActual === idx + 1 ? 'documento-chofer-pagina-activa' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="documento-chofer-pagina-btn documento-chofer-pagina-next"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionDocumentoChoferes;