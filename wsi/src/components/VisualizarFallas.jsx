import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faTrashAlt, faCar, faUser, faCalendarAlt, faExclamationTriangle, faClipboard, faPlus } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import bgImage from '../assets/bg-login.jpg';
import { ToastContainer, toast } from 'react-toastify';
import "../styles/VerFalla.css";
import { verifyToken } from "../services/auth";

const VisualizarFallas = () => {
  const [fallas, setFallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Verificar token y rol del usuario
  useEffect(() => {
    const checkAuth = async () => {
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
    }catch (error) {
        logout();
      }
    };
    checkAuth();
  }, [navigate]);

  // Obtener datos de las fallas
  useEffect(() => {
    setLoading(true);
    // Simular llamada a API
    setTimeout(() => {
      const mockFallas = [
        {
          id_reporte: 1,
          id_vehiculo: { id: 101, placa: 'ABC-123' },
          id_usuario: { id: 1, nombre: 'Carlos Rodríguez' },
          motivo_falla: 'Falla en el motor',
          fecha_reporte: '2024-06-01',
          observaciones: 'El vehículo no enciende',
          estado: 'Operativo'
        },
        {
          id_reporte: 2,
          id_vehiculo: { id: 102, placa: 'XYZ-789' },
          id_usuario: { id: 2, nombre: 'María Pérez' },
          motivo_falla: 'Frenos desgastados',
          fecha_reporte: '2024-06-10',
          observaciones: 'El vehículo tiene problemas al frenar',
          estado: 'En revisión'
        },
        {
          id_reporte: 3,
          id_vehiculo: { id: 103, placa: 'JKL-456' },
          id_usuario: { id: 3, nombre: 'José angulo' },
          motivo_falla: 'Neumáticos desgastados',
          fecha_reporte: '2024-06-15',
          observaciones: 'Necesita cambio de neumáticos',
          estado: 'Inoperativo'
        }
      ];
      setFallas(mockFallas);
      setLoading(false);
    }, 1000);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const handleAtendido = (id) => {
    // Actualizar el estado a 'Atendido'
    setFallas(fallas.map(falla => 
      falla.id_reporte === id ? { ...falla, estado: 'Atendido' } : falla
    ));
    toast.success('Reporte marcado como atendido');
  };

  const handleEliminar = (id) => {
    // Eliminar el reporte
    setFallas(fallas.filter(falla => falla.id_reporte !== id));
    toast.info('Reporte eliminado');
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'Operativo': return 'estado-operativo';
      case 'Inoperativo': return 'estado-inoperativo';
      case 'En revisión': return 'estado-revision';
      case 'Atendido': return 'estado-atendido';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="fallas-loader-container">
        <div className="fallas-loader"></div>
        <p>Cargando reportes...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="fallas-home-wrapper">
      {/* Imagen de fondo */}
      <div className="fallas-bg">
        <img src={bgImage} alt="Fondo Home" onError={e => (e.target.style.display = 'none')} />
      </div>

      {/* Header */}
      <Header title="WSI" />
      
      <div className="fallas-container">
        <div className="fallas-card">
          <div className="fallas-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="fallas-titulo">Reportes de Fallas</h2>
            <button
              className="fallas-boton-volver"
              style={{
                background: '#ff6a00',      // Naranja
                color: '#fff',              // Blanco
                border: '1px solid #ff6a00',
                fontWeight: 600,
                borderRadius: 8,
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/reportar-falla')}
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
              Registrar Falla
            </button>
          </div>
          
          <div className="fallas-list">
            {fallas.length === 0 ? (
              <p className="fallas-sin-datos">No hay reportes de fallas registrados.</p>
            ) : (
              fallas.map(falla => (
                <div key={falla.id_reporte} className="falla-item">
                  <div className="falla-header">
                    <span className="falla-id">Reporte #{falla.id_reporte}</span>
                    <span className={`falla-estado ${getEstadoClass(falla.estado)}`}>
                      {falla.estado}
                    </span>
                  </div>
                  
                  <div className="falla-content">
                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faCar} className="falla-icon" />
                      <span className="falla-label">Vehículo:</span>
                      <span className="falla-value">{falla.id_vehiculo.placa}</span>
                    </div>
                    
                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faUser} className="falla-icon" />
                      <span className="falla-label">Reportado por:</span>
                      <span className="falla-value">{falla.id_usuario.nombre}</span>
                    </div>
                    
                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faCalendarAlt} className="falla-icon" />
                      <span className="falla-label">Fecha de reporte:</span>
                      <span className="falla-value">{formatFecha(falla.fecha_reporte)}</span>
                    </div>
                    
                    <div className="falla-info-row">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="falla-icon" />
                      <span className="falla-label">Motivo:</span>
                      <span className="falla-value">{falla.motivo_falla}</span>
                    </div>
                    
                    {falla.observaciones && (
                      <div className="falla-info-row">
                        <FontAwesomeIcon icon={faClipboard} className="falla-icon" />
                        <span className="falla-label">Observaciones:</span>
                        <span className="falla-value">{falla.observaciones}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="falla-actions">
                    <button 
                      className="falla-btn-atendido"
                      onClick={() => handleAtendido(falla.id_reporte)}
                      disabled={falla.estado === 'Atendido'}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} /> 
                      {falla.estado === 'Atendido' ? 'Atendido' : 'Marcar como atendido'}
                    </button>
                    <button 
                      className="falla-btn-eliminar"
                      onClick={() => handleEliminar(falla.id_reporte)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default VisualizarFallas;