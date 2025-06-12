import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faTrashAlt, faEnvelope, faPhone, faIdCard, faUserTie, faCalendar } from '@fortawesome/free-solid-svg-icons';
import Header from '../../header';
import '../../../styles/DetalleEmpleados.css';
import bgImage from '../../../assets/bg-login.jpg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken } from "../../../services/auth";

const DetalleEmpleado = () => {
  const { id } = useParams();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Obtener detalles del empleado por ID
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }
    fetch(`http://localhost:8000/api/detalle-usuarios/${id}/`, {
      headers: {
        "Authorization": `Token ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          return null;
        }
        if (!res.ok) {
          throw new Error('No se pudo cargar el empleado');
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setEmpleado(data);
        }
      })
      .catch(() => toast.error('No se pudieron cargar los detalles del empleado'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const getTipoCedula = (tipo) => {
    switch(tipo) {
      case 'V': return 'Venezolano';
      case 'E': return 'Extranjero';
      case 'P': return 'Pasaporte';
      default: return tipo;
    }
  };

  const getRolNombre = (rol) => {
    if (rol == 1 || rol === '1') return 'Supervisor';
    if (rol == 2 || rol === '2') return 'Empleado';
    return rol;
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const handleVolver = () => {
    navigate('/gestion-empleados');
  };

  const handleEditar = () => {
    toast.info('Funcionalidad de edición en desarrollo');
  };

  const handleEliminar = () => {
    toast.info('Funcionalidad de eliminación en desarrollo');
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

  if (!empleado) {
    return (
      <div className="empleados-home-wrapper">
        <div className="empleados-bg">
          <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
        </div>
        <Header title="WSI" />
        <div className="detalle-empleado-container">
          <div className="detalle-empleado-card">
            <h2 className="detalle-empleado-titulo">Empleado no encontrado</h2>
            <p>El empleado solicitado no existe o no se pudo cargar.</p>
            <button className="detalle-empleado-boton-volver" onClick={handleVolver}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
              Volver a la lista
            </button>
          </div>
        </div>
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
      
      <div className="detalle-empleado-container">
        <div className="detalle-empleado-card">
          <div className="detalle-empleado-header">
            <div className="detalle-empleado-acciones">
              {/* Botones de acción aquí si los necesitas */}
            </div>
          </div>
          
          <div className="detalle-empleado-profile">
            <div className="avatar-iniciales">
              {empleado.nombre?.charAt(0)}{empleado.apellido?.charAt(0)}
            </div>
            <div className="detalle-empleado-nombre">
              {empleado.nombre} {empleado.apellido}
            </div>
            <div className={`detalle-empleado-rol ${empleado.rol == 1 || empleado.rol === '1' ? 'rol-supervisor' : 'rol-empleado'}`}>
              {getRolNombre(empleado.rol)}
            </div>
          </div>
          
          <div className="detalle-empleado-info-grid">
            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faIdCard} />
              </div>
              <div className="info-content">
                <h3>Información Personal</h3>
                <div className="info-row">
                  <span className="info-label">Tipo de Documento:</span>
                  <span className="info-value">{getTipoCedula(empleado.tipoCedula)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Cédula:</span>
                  <span className="info-value">{empleado.cedula}</span>
                </div>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div className="info-content">
                <h3>Contacto</h3>
                <div className="info-row">
                  <span className="info-label">Correo:</span>
                  <span className="info-value">{empleado.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{empleado.telefono || 'No especificado'}</span>
                </div>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <div className="info-content">
                <h3>Información Laboral</h3>
                <div className="info-row">
                  <span className="info-label">Cargo:</span>
                  <span className="info-value">{getRolNombre(empleado.rol)}</span>
                </div>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <FontAwesomeIcon icon={faCalendar} />
              </div>
              <div className="info-content">
                <h3>Registro</h3>
                <div className="info-row">
                  <span className="info-label">Fecha de Registro:</span>
                  <span className="info-value">{formatFecha(empleado.fechaRegistro)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DetalleEmpleado;