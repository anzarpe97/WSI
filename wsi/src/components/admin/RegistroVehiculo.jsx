import React, { useState, useEffect, useRef } from 'react';
import Header from '../header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/RegistroVehiculo.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken } from '../../services/auth';

const RegistroVehiculo = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  // Verificación de token, rol y temporizador de inactividad
  useEffect(() => {
    document.title = "WSI - Registro Vehículo";
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
        }
      } catch (error) {
        logout();
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
    // eslint-disable-next-line
  }, [navigate]);

  const logout = (isInactivityLogout = false) => {
    localStorage.removeItem('token');
    navigate('/login', {
      replace: true,
      state: isInactivityLogout ? { sessionExpired: true } : undefined
    });
  };

  const [form, setForm] = useState({
    placaVehiculo: '',
    kilometraje: '',
    estadoVehiculo: '',
    modeloVehiculo: '',
    motorVehiculo: '',
    anoVehiculo: '',
    marcaVehiculo: '',
    colorVehiculo: '',
    tipologia: '',
    capacidadCombustible: '',
    tipoCombustible: '',
    capacidadCarga: '',
    costo: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.placaVehiculo.trim()) {
      newErrors.placaVehiculo = 'La placa es requerida';
    } else if (!/^[A-Za-z0-9-]+$/.test(form.placaVehiculo)) {
      newErrors.placaVehiculo = 'La placa solo puede contener letras, números y guiones';
    } else if (form.placaVehiculo.length > 10) {
      newErrors.placaVehiculo = 'La placa no puede tener más de 10 caracteres';
    }

    if (!form.kilometraje.trim()) {
      newErrors.kilometraje = 'El kilometraje es requerido';
    } else if (!/^\d+$/.test(form.kilometraje) || Number(form.kilometraje) < 0) {
      newErrors.kilometraje = 'El kilometraje debe ser un número positivo';
    }

    if (!form.estadoVehiculo) {
      newErrors.estadoVehiculo = 'El estado es requerido';
    }

    if (!form.modeloVehiculo.trim()) {
      newErrors.modeloVehiculo = 'El modelo es requerido';
    } else if (!/^[A-Za-z0-9\s-]+$/.test(form.modeloVehiculo)) {
      newErrors.modeloVehiculo = 'El modelo solo puede contener letras, números y guiones';
    } else if (form.modeloVehiculo.length > 20) {
      newErrors.modeloVehiculo = 'El modelo no puede tener más de 20 caracteres';
    }

    if (!form.motorVehiculo.trim()) {
      newErrors.motorVehiculo = 'El número/código de motor es requerido';
    } else if (form.motorVehiculo.length > 50) {
      newErrors.motorVehiculo = 'El número/código de motor no puede tener más de 50 caracteres';
    }

    const currentYear = new Date().getFullYear();
    if (!form.anoVehiculo.trim()) {
      newErrors.anoVehiculo = 'El año es requerido';
    } else if (!/^\d{4}$/.test(form.anoVehiculo)) {
      newErrors.anoVehiculo = 'El año debe tener 4 dígitos';
    } else if (Number(form.anoVehiculo) < 1950 || Number(form.anoVehiculo) > currentYear) {
      newErrors.anoVehiculo = `El año debe estar entre 1950 y ${currentYear}`;
    }

    if (!form.marcaVehiculo.trim()) {
      newErrors.marcaVehiculo = 'La marca es requerida';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.marcaVehiculo)) {
      newErrors.marcaVehiculo = 'La marca solo puede contener letras y espacios';
    } else if (form.marcaVehiculo.length > 20) {
      newErrors.marcaVehiculo = 'La marca no puede tener más de 20 caracteres';
    }

    if (!form.colorVehiculo.trim()) {
      newErrors.colorVehiculo = 'El color es requerido';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.colorVehiculo)) {
      newErrors.colorVehiculo = 'El color solo puede contener letras y espacios';
    } else if (form.colorVehiculo.length > 20) {
      newErrors.colorVehiculo = 'El color no puede tener más de 20 caracteres';
    }

    if (!form.tipologia.trim()) {
      newErrors.tipologia = 'La tipología es requerida';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.tipologia)) {
      newErrors.tipologia = 'La tipología solo puede contener letras y espacios';
    } else if (form.tipologia.length > 20) {
      newErrors.tipologia = 'La tipología no puede tener más de 20 caracteres';
    }

    if (!form.capacidadCombustible.trim()) {
      newErrors.capacidadCombustible = 'La capacidad de combustible es requerida';
    } else if (!/^\d+$/.test(form.capacidadCombustible) || Number(form.capacidadCombustible) <= 0) {
      newErrors.capacidadCombustible = 'Debe ser un número positivo';
    }

    if (!form.tipoCombustible) {
      newErrors.tipoCombustible = 'El tipo de combustible es requerido';
    }

    if (!form.capacidadCarga.trim()) {
      newErrors.capacidadCarga = 'La capacidad de carga es requerida';
    } else if (!/^\d+$/.test(form.capacidadCarga) || Number(form.capacidadCarga) <= 0) {
      newErrors.capacidadCarga = 'Debe ser un número positivo';
    }

    if (!form.costo.trim()) {
      newErrors.costo = 'El costo es requerido';
    } else if (!/^\d+$/.test(form.costo) || Number(form.costo) <= 0) {
      newErrors.costo = 'Debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = {
        placa: form.placaVehiculo,
        kilometraje: Number(form.kilometraje),
        estado: form.estadoVehiculo,
        marca: form.marcaVehiculo,
        modelo: form.modeloVehiculo,
        motor: form.motorVehiculo,
        anio: Number(form.anoVehiculo),
        color: form.colorVehiculo,
        tipologia: form.tipologia,
        capacidad_carga: Number(form.capacidadCarga),
        capacidad_combustible: Number(form.capacidadCombustible),
        costo: Number(form.costo),
        tipo_combustible: form.tipoCombustible,
      };

      await axios.post(
        'http://localhost:8000/api/vehiculos/registrar/',
        data,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Vehículo registrado exitosamente');
      setForm({
        placaVehiculo: '',
        kilometraje: '',
        estadoVehiculo: '',
        modeloVehiculo: '',
        motorVehiculo: '',
        anoVehiculo: '',
        marcaVehiculo: '',
        colorVehiculo: '',
        tipologia: '',
        capacidadCombustible: '',
        tipoCombustible: '',
        capacidadCarga: '',
        costo: '',
      });
      setErrors({});
    } catch (error) {
      if (error.response && error.response.data) {
        console.log(error.response.data);
        setErrors(error.response.data);
        toast.error('Error al registrar el vehículo');
      } else {
        toast.error('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-wrapper">
      <Header title="WSI" />

      <div className="registro-empleado-bg">
       
      </div>

      <div className="registro-empleado-container">
        <h2 className="titulo">Registro Vehículo</h2>
        <form className="formulario" onSubmit={handleSubmit} noValidate>
          <div className="fila">
            <div className="campo">
              <label htmlFor="placaVehiculo">Placa Vehículo</label>
              <input
                type="text"
                id="placaVehiculo"
                name="placaVehiculo"
                placeholder="Placa Vehículo"
                value={form.placaVehiculo}
                onChange={handleChange}
                maxLength={10}
                required
              />
              {errors.placaVehiculo && <small className="error">{errors.placaVehiculo}</small>}
            </div>
            <div className="campo">
              <label htmlFor="kilometraje">Kilometraje</label>
              <input
                type="number"
                id="kilometraje"
                name="kilometraje"
                placeholder="Kilometraje"
                value={form.kilometraje}
                onChange={handleChange}
                required
              />
              {errors.kilometraje && <small className="error">{errors.kilometraje}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="estadoVehiculo">Estado Vehículo</label>
              <select
                id="estadoVehiculo"
                name="estadoVehiculo"
                value={form.estadoVehiculo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
              </select>
              {errors.estadoVehiculo && <small className="error">{errors.estadoVehiculo}</small>}
            </div>
            <div className="campo">
              <label htmlFor="modeloVehiculo">Modelo Vehículo</label>
              <input
                type="text"
                id="modeloVehiculo"
                name="modeloVehiculo"
                placeholder="Modelo Vehículo"
                value={form.modeloVehiculo}
                onChange={handleChange}
                maxLength={20}
                required
              />
              {errors.modeloVehiculo && <small className="error">{errors.modeloVehiculo}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="motorVehiculo">Número/Código de Motor</label>
              <input
                type="text"
                id="motorVehiculo"
                name="motorVehiculo"
                placeholder="Número/Código de Motor"
                value={form.motorVehiculo}
                onChange={handleChange}
                maxLength={50}
                required
              />
              {errors.motorVehiculo && <small className="error">{errors.motorVehiculo}</small>}
            </div>
            <div className="campo">
              <label htmlFor="anoVehiculo">Año Vehículo</label>
              <input
                type="number"
                id="anoVehiculo"
                name="anoVehiculo"
                placeholder="Año Vehículo"
                value={form.anoVehiculo}
                onChange={handleChange}
                required
              />
              {errors.anoVehiculo && <small className="error">{errors.anoVehiculo}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="marcaVehiculo">Marca Vehículo</label>
              <input
                type="text"
                id="marcaVehiculo"
                name="marcaVehiculo"
                placeholder="Marca Vehículo"
                value={form.marcaVehiculo}
                onChange={handleChange}
                maxLength={20}
                required
              />
              {errors.marcaVehiculo && <small className="error">{errors.marcaVehiculo}</small>}
            </div>
            <div className="campo">
              <label htmlFor="colorVehiculo">Color Vehículo</label>
              <input
                type="text"
                id="colorVehiculo"
                name="colorVehiculo"
                placeholder="Color Vehículo"
                value={form.colorVehiculo}
                onChange={handleChange}
                maxLength={20}
                required
              />
              {errors.colorVehiculo && <small className="error">{errors.colorVehiculo}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="tipologia">Tipología</label>
              <input
                type="text"
                id="tipologia"
                name="tipologia"
                placeholder="Tipología"
                value={form.tipologia}
                onChange={handleChange}
                maxLength={20}
                required
              />
              {errors.tipologia && <small className="error">{errors.tipologia}</small>}
            </div>
            <div className="campo">
              <label htmlFor="capacidadCombustible">Capacidad Combustible</label>
              <input
                type="number"
                id="capacidadCombustible"
                name="capacidadCombustible"
                placeholder="Litros"
                value={form.capacidadCombustible}
                onChange={handleChange}
                required
              />
              {errors.capacidadCombustible && <small className="error">{errors.capacidadCombustible}</small>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label htmlFor="tipoCombustible">Tipo de Combustible</label>
              <select
                id="tipoCombustible"
                name="tipoCombustible"
                value={form.tipoCombustible}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione Combustible</option>
                <option value="DIESEL">Diesel</option>
                <option value="GASOLINA">Gasolina</option>
              </select>
              {errors.tipoCombustible && <small className="error">{errors.tipoCombustible}</small>}
            </div>
            <div className="campo">
              <label htmlFor="capacidadCarga">Capacidad Carga</label>
              <input
                type="number"
                id="capacidadCarga"
                name="capacidadCarga"
                placeholder="kg"
                value={form.capacidadCarga}
                onChange={handleChange}
                required
              />
              {errors.capacidadCarga && <small className="error">{errors.capacidadCarga}</small>}
            </div>
            <div className="campo">
              <label htmlFor="costo">Costo</label>
              <input
                type="number"
                id="costo"
                name="costo"
                placeholder="Costo"
                value={form.costo}
                onChange={handleChange}
                required
              />
              {errors.costo && <small className="error">{errors.costo}</small>}
            </div>
          </div>

          <button type="submit" className="boton-registrar" disabled={loading}>
            {loading ? (
              <>
                Registrando...
                <span className="loader-with-text"></span>
              </>
            ) : (
              'Registrar Vehículo'
            )}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={6000} />
    </div>
  );
};

export default RegistroVehiculo;