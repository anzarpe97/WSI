import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../styles/VerVehiculos.css';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
import { verifyToken } from '../../services/auth';
import { getVehiculos } from '../../services/vehiculos';
import { toast } from 'react-toastify';

const PAGE_SIZE = 5;

const VerVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('');
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

  useEffect(() => {
    document.title = "WSI - Vehículos";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          // Si el rol no es 0, redirige al home correspondiente
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
    return coincideEstado && coincidePlaca;
  });

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
          <button
            className="boton-crear-vehiculo"
            onClick={handleRegistroVehiculoClick}
          >
            <FontAwesomeIcon icon={faPlus} className="icono-boton" />
            Registrar Vehículo
          </button>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ fontWeight: 600 }}>Filtrar por estado:</label>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="mantenimiento-filtro-select"
            style={{ minWidth: 160 }}
          >
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
          </select>
          <label style={{ fontWeight: 600 }}>Filtrar por placa:</label>
          <input
            type="text"
            placeholder="Buscar placa..."
            value={filtroPlaca}
            onChange={e => setFiltroPlaca(e.target.value)}
            style={{ borderRadius: 18, border: '1.5px solid #ff6a00', padding: '7px 12px', fontSize: 15 }}
          />
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
              {vehiculosPagina.length === 0 ? (
                <tr key="no-vehiculos">
                  <td colSpan="6" style={{ textAlign: 'center' }}>No hay vehículos registrados.</td>
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
                        <FontAwesomeIcon icon={faEye} size="lg" className="accion-icon" title="Ver detalles" style={{ cursor: 'pointer' }} onClick={() => handleVerDetalles(vehiculo.id_vehiculo)}/>
                        <FontAwesomeIcon icon={faPen} size="lg" className="accion-icon" title="Editar vehículo" style={{ cursor: 'pointer' }} onClick={() => navigate(`/editar-vehiculo/${vehiculo.id_vehiculo}`)}/>
                        <FontAwesomeIcon icon={faTrashAlt} size="lg" className="accion-icon" title="Eliminar vehículo"/>
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

export default VerVehiculos;