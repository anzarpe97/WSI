import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/GestionEmpleados.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../header';
import bgImage from '../../../assets/bg-login.jpg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken } from "../../../services/auth";

const PAGE_SIZE = 5;

const GestionEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCedula, setFiltroCedula] = useState('');
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
        }
      } catch (error) {
        logout();
      }
    };
    checkAuth();
  }, [navigate]);
  // --- FIN VERIFICACIÓN ROL ---

  useEffect(() => {
    document.title = "WSI - Empleados";
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    fetch("http://localhost:8000/api/usuarios/", {
      headers: {
        "Authorization": `Token ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setEmpleados(data);
        }
      })
      .catch(() => toast.error('No se pudieron cargar los empleados'))
      .finally(() => setLoading(false));

    // --- Temporizador de inactividad ---
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 1200000); // 20 minutos = 1200000 ms
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // --- Fin temporizador ---
  }, [navigate]);

const empleadosFiltradosRol = empleados.filter(e => 
  e.rol == 1 || e.rol == 2 || 
  e.rol === '1' || e.rol === '2'  
);
  const empleadosFiltrados = empleadosFiltradosRol.filter(e =>
  filtroCedula ? e.cedula.toLowerCase().includes(filtroCedula.toLowerCase()) : true
  );

  // Paginación
  const totalPaginas = Math.ceil(empleadosFiltrados.length / PAGE_SIZE);
  const empleadosPagina = empleadosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  // Resetear página al cambiar filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroCedula]);

  const handleRegistroEmpleadoClick = () => {
    navigate('/registro-empleado');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-empleado/${id}`);
  };

  const getRolNombre = (rol) => {
     if (rol == 1 || rol === '1') return 'Supervisor';
      if (rol == 2 || rol === '2') return 'Empleado';
    return rol;
  };

  if (loading) {
    return (
      <div className="empleados-loader-container">
        <div className="empleados-loader"></div>
        <p>Cargando...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="empleados-home-wrapper">
      {/* Imagen de fondo */}
      <div className="empleados-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />

      
      <div className="gestion-empleados-container">
        <div className="empleados-titulo-container">
          <h2 className="empleados-titulo">Empleados Registrados</h2>
          <button
            className="empleados-boton-crear"
            onClick={handleRegistroEmpleadoClick}
          >
            <FontAwesomeIcon icon={faPlus} className="empleados-icono-boton" />
            Registrar Empleado
          </button>
        </div>

        {/* Filtro por cédula */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ fontWeight: 600 }}>Filtrar por cédula:</label>
          <input
            type="text"
            placeholder="Buscar cédula..."
            value={filtroCedula}
            onChange={e => setFiltroCedula(e.target.value)}
            style={{ borderRadius: 18, border: '1.5px solid #ff6a00', padding: '7px 12px', fontSize: 15 }}
          />
        </div>

        <div className="empleados-table-responsive">
          <table className="tabla-empleados">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Cédula</th>
                <th>Correo</th>
                <th>Cargo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosPagina.length === 0 ? (
                <tr key="no-empleados">
                  <td colSpan="5" style={{ textAlign: 'center' }}>No hay empleados registrados.</td>
                </tr>
              ) : (
                empleadosPagina.map((empleado) => (
                  <tr key={empleado.id}>
                    <td data-label="Nombre">{`${empleado.nombre} ${empleado.apellido}`}</td>
                    <td data-label="Cédula">{empleado.cedula}</td>
                    <td data-label="Correo">{empleado.email}</td>
                    <td data-label="Cargo">{getRolNombre(empleado.rol)}</td>
                    <td data-label="Acciones">
                      <div className="empleados-acciones">
                        <FontAwesomeIcon
                          icon={faEye}
                          size="lg"
                          className="empleados-accion-icon"
                          title="Ver detalles"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleVerDetalles(empleado.id)}
                        />
                        <FontAwesomeIcon 
                          icon={faTrashAlt} 
                          size="lg" 
                          className="empleados-accion-icon" 
                          title="Eliminar empleado"
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
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
              style={{
                background: '#fff',
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
                onClick={() => setPaginaActual(idx + 1)}
                style={{
                  background: '#fff',
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
              onClick={() => setPaginaActual(paginaActual + 1)}
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
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
  );
};

export default GestionEmpleados;