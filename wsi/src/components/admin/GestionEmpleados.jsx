import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../styles/GestionEmpleados.css';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
//import { verifyToken } from '../../services/auth';
//import { getEmpleados } from '../../services/empleados';

const GestionEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "WSI - Empleados";
    const check = async () => {
      try {
        const result = await verifyToken();
        if (!result.isValid) {
          navigate('/login');
          return;
        }
        // Si el token es válido, carga los empleados
        const data = await getEmpleados();
        setEmpleados(data);
      } catch (error) {
        setError('No se pudieron cargar los empleados');
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [navigate]);

  const handleRegistroEmpleadoClick = () => {
    navigate('/registro-empleado');
  };

  const handleVerDetalles = (id) => {
    navigate(`/detalle-empleado/${id}`);
  };

  if (loading) {
    return (
      <div className="empleados-loader-container">
        <div className="empleados-loader"></div>
        <p>Cargando...</p>
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

      {/* Contenedor principal */}
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

        {error && <p style={{ color: 'red' }}>{error}</p>}

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
              {empleados.length === 0 ? (
                <tr key="no-empleados">
                  <td colSpan="5" style={{ textAlign: 'center' }}>No hay empleados registrados.</td>
                </tr>
              ) : (
                empleados.map((empleado) => (
                  <tr key={empleado.id_empleado}>
                    <td data-label="Nombre">{`${empleado.nombre} ${empleado.apellido}`}</td>
                    <td data-label="Cédula">{empleado.cedula}</td>
                    <td data-label="Correo">{empleado.correo}</td>
                    <td data-label="Cargo">{empleado.cargo}</td>
                    <td data-label="Acciones">
                      <div className="empleados-acciones">
                        <FontAwesomeIcon
                          icon={faEye}
                          size="lg"
                          className="empleados-accion-icon"
                          title="Ver detalles"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleVerDetalles(empleado.id_empleado)}
                        />
                        <FontAwesomeIcon 
                          icon={faPen} 
                          size="lg" 
                          className="empleados-accion-icon" 
                          title="Editar empleado"
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
      </div>
    </div>
  );
};

export default GestionEmpleados;