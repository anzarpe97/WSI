import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RegistroEmpleado.css";
import Header from '../../header';
import bgImage from "../../assets/bg-login.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBell, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegistroEmpleado = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoCedula: "V",
    cedula: "",
    telefono: "",
    rol: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  // Función para cerrar sesión
  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem("token");
    navigate("/login", {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  // Verificación de token y temporizador de inactividad
  useEffect(() => {
    document.title = "WSI - Registro Empleado";
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Debe iniciar sesión para acceder a esta página");
      logout();
      return;
    }
    axios
      .get("http://localhost:8000/api/verify-token/", {
        headers: { Authorization: `Token ${token}` },
      })
      .catch(() => {
        localStorage.removeItem("token");
        toast.error("Sesión expirada, por favor inicie sesión nuevamente");
        logout();
      });

    // --- Temporizador de inactividad ---
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        toast.info('Sesión cerrada por inactividad');
        logout(true);
      }, 300000); // 5 minutos = 300,000 ms
    };
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
    // --- Fin temporizador ---
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
      newErrors.nombre = "El nombre solo puede contener letras y espacios";
    } else if (formData.nombre.length > 30) {
      newErrors.nombre = "El nombre no puede tener más de 30 caracteres";
    }

    // Validación de apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.apellido)) {
      newErrors.apellido = "El apellido solo puede contener letras y espacios";
    } else if (formData.apellido.length > 30) {
      newErrors.apellido = "El apellido no puede tener más de 30 caracteres";
    }

    // Validación de cédula
    if (!/^\d+$/.test(formData.cedula)) {
      newErrors.cedula = "La cédula solo debe contener números";
    } else if (formData.cedula.length < 7 || formData.cedula.length > 8) {
      newErrors.cedula = "La cédula debe tener entre 7 y 8 números";
    }

    if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe tener 10 números";
    }

    if (!["0", "1", "2"].includes(formData.rol)) {
      newErrors.rol = "Selecciona un rol válido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else {
      if (formData.password.length < 8) {
        newErrors.password = "Mínimo 8 caracteres";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Debe tener al menos una mayúscula";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Debe tener al menos un número";
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        newErrors.password = "Debe tener al menos un carácter especial";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/api/registro/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      toast.success("Empleado registrado exitosamente");
      setFormData({
        nombre: "",
        apellido: "",
        tipoCedula: "V",
        cedula: "",
        telefono: "",
        rol: "",
        email: "",
        password: "",
      });
      setErrors({});
    } catch (error) {
      if (error.response?.data) {
        // Mostrar errores del servidor
        Object.values(error.response.data).forEach(errorMsg => {
          toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        });
      } else {
        toast.error("Error al registrar empleado. Por favor intente nuevamente.");
      }
    }
  };

  return (
    <div className="registro-empleado-wrapper">
      
      <div className="registro-empleado-bg">
        <img
          src={bgImage}
          alt="Fondo Registro Empleado"
          onError={(e) => {
            e.target.style.display = "none";
            toast.warn("No se pudo cargar la imagen de fondo");
          }}
        />
      </div>
      
      <Header title="WSI" />
      
      {/* Toast container */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />


      <div className="registro-empleado-container">
        <h1 className="titulo">Registro Empleado</h1>
        <form className="formulario" onSubmit={handleSubmit} noValidate>
          <div className="fila">
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && <small className="error">{errors.nombre}</small>}
            </div>
            <div className="campo">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && <small className="error">{errors.apellido}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="tipoCedula">Cédula</label>
              <select
                id="tipoCedula"
                name="tipoCedula"
                value={formData.tipoCedula}
                onChange={handleChange}
              >
                <option value="V">V</option>
                <option value="E">E</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="cedula">Número de Cédula</label>
              <input
                type="text"
                id="cedula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                maxLength={8}
                placeholder="Ej: 12345678"
              />
              {errors.cedula && <small className="error">{errors.cedula}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="rol">Cargo</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="0">Administrador</option>
                <option value="1">Supervisor</option>
                <option value="2">Empleado</option>
              </select>
              {errors.rol && <small className="error">{errors.rol}</small>}
            </div>
            <div className="campo">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                maxLength={10}
                placeholder="Ej: 04121234567"
              />
              {errors.telefono && <small className="error">{errors.telefono}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ej: usuario@empresa.com"
              />
              {errors.email && <small className="error">{errors.email}</small>}
            </div>
            <div className="campo">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && <small className="error">{errors.password}</small>}
            </div>
          </div>

          <button type="submit" className="boton-registrar">
            Registrar Empleado
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroEmpleado;