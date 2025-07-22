// GestionDocumentoVehiculos.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus, faFileAlt, faCar } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/GestionDocumentosVehiculos.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../header';
import bgImage from '../../../assets/bg-login.jpg';
import { toast } from 'react-toastify';
import { verifyToken } from '../../../services/auth';

const PAGE_SIZE = 5;

const VerDocumentoVehiculos = () => {
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
        // Solo los roles 0 (admin) y 1 (supervisor) pueden entrar
        if (String(result.user.rol) !== "0" && String(result.user.rol) !== "1") {
          if (String(result.user.rol) === "2") {
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
        const response = await fetch('http://localhost:8000/api/documentos-vehiculos/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          setDocumentos([]);
          return;
        }
        const data = await response.json();
        // Mapear para mostrar info del vehículo si es necesario
        const documentosMapeados = Array.isArray(data)
          ? data.map(doc => ({
              ...doc,
              vehiculo_placa: doc.Vehiculo?.placa || doc.vehiculo_placa || '',
              vehiculo_marca: doc.Vehiculo?.marca || doc.vehiculo_marca || '',
            }))
          : [];
        setDocumentos(documentosMapeados);
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
    navigate('/registro-documentos-vehiculo');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-documento-vehiculo/${id}`);
  };

  const handleEditarDocumento = (id) => {
    navigate(`/editar-documento-vehiculo/${id}`);
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
      'SEGURO': 'Seguro',
      'TITULO_PROPIEDAD': 'Título de Propiedad',
      'REVISION_TECNICA': 'Revisión Técnica',
      'CIRCULACION': 'Permiso de Circulación',
      'OTRO': 'Otro',
    };
    return tipos[tipo] || tipo;
  };

  // Formatear el ID del documento
  const formatIdDocumento = (id) => `DOCV-00${id}`;

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
    <div className="documento-vehiculo-home-wrapper">
      {/* Imagen de fondo */}
      <div className="documento-vehiculo-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />

      {/* Contenedor principal */}
      <div className="gestion-documento-vehiculo-container">
        <div className="documento-vehiculo-titulo-container">
          <h2 className="documento-vehiculo-titulo">
            <FontAwesomeIcon icon={faCar} className="documento-vehiculo-icono-titulo" />
            Documentos de Vehículos
          </h2>
          <button
            className="documento-vehiculo-boton-crear"
            onClick={handleRegistroDocumentoClick}
          >
            <FontAwesomeIcon icon={faPlus} className="documento-vehiculo-icono-boton" />
            Registrar Documento
          </button>
        </div>

        {/* Filtros */}
        <div className="documento-vehiculo-filtros-container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="documento-vehiculo-filtro">
            <label>Filtrar por estado:</label>
            <select value={filtroEstado} onChange={handleFiltroEstado} className="documento-vehiculo-filtro-select" >
              <option value="">Todos</option>
              <option value="VIGENTE">Vigente</option>
              <option value="PROXIMO_VENCER">Próximo a vencer</option>
              <option value="VENCIDO">Vencido</option>
            </select>
          </div>
          <button
            className="documento-vehiculo-boton-crear"
            style={{ minWidth: 180, display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/actualizar-documento-vehiculo')}
            disabled={documentos.length === 0}
          >
            <FontAwesomeIcon icon={faPen} className="documento-vehiculo-icono-boton" style={{ marginRight: 8 }} />
            Actualizar Documentos
          </button>
        </div>

        <div className="documento-vehiculo-table-responsive">
          <table className="tabla-documentos-vehiculos">
            <thead>
              <tr>
                <th>ID Documento</th>
                <th>Vehículo</th>
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
                  <td colSpan="7" className="documento-vehiculo-sin-registros">
                    <FontAwesomeIcon icon={faFileAlt} className="documento-vehiculo-icono-vacio" />
                    No hay documentos registrados.
                  </td>
                </tr>
              ) : (
                documentosPagina.map((documento) => {
                  const estado = calcularEstado(documento.fecha_caducidad);
                  return (
                    <tr key={documento.id_documento_vehiculo}>
                      <td data-label="ID Documento">{formatIdDocumento(documento.id_documento_vehiculo)}</td>
                      <td data-label="Vehículo">
                        <div className="documento-vehiculo-info-vehiculo">
                          <div className="documento-vehiculo-avatar">
                            {documento.vehiculo_placa?.charAt(0) || 'V'}
                          </div>
                          <div>
                            <div className="documento-vehiculo-placa">{documento.vehiculo_placa || 'N/A'}</div>
                            <div className="documento-vehiculo-marca">{documento.vehiculo_marca || ''}</div>
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
                          <div className="documento-vehiculo-alerta">
                            {calcularDiasRestantes(documento.fecha_caducidad)} días
                          </div>
                        )}
                      </td>
                      <td data-label="Estado">
                        <span className={`documento-vehiculo-estado-badge estado-${estado.toLowerCase()}`}>
                          {traducirEstado(estado)}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="documento-vehiculo-acciones">
                          <button 
                            className="documento-vehiculo-accion-btn"
                            onClick={() => handleVerDetalles(documento.id_documento_vehiculo)}
                            title="Ver detalles"
                          >
                            <FontAwesomeIcon icon={faEye} size="lg" />
                          </button>
                          <button 
                            className="documento-vehiculo-accion-btn"
                            onClick={() => handleEliminarDocumento(documento.id_documento_vehiculo)}
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
          <div className="documento-vehiculo-paginacion">
            <button
              onClick={() => handlePagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="documento-vehiculo-pagina-btn documento-vehiculo-pagina-prev"
            >
              Anterior
            </button>
            {[...Array(totalPaginas)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePagina(idx + 1)}
                className={`documento-vehiculo-pagina-btn ${paginaActual === idx + 1 ? 'documento-vehiculo-pagina-activa' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="documento-vehiculo-pagina-btn documento-vehiculo-pagina-next"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default VerDocumentoVehiculos;