import React, { useEffect, useState } from "react";
import "../../styles/RegistroMantenimiento.css";
import bgImage from '../../assets/bg-login.jpg';
import Header from '../header';

const RegistroMantenimiento = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:8000/api/vehiculos-usuarios/", {
      headers: {
        "Authorization": `Token ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setVehiculos(data.vehiculos || []);
          setMecanicos(data.usuarios || []);
        }
      })
      .catch(err => console.error("Error cargando datos:", err));
  }, []);

  return (
    <div className="home-wrapper">
      <Header title="WSI" />
      <div className="registro-mantenimiento-wrapper">
        <div className="registro-mantenimiento-bg">
          <img
            src={bgImage}
            alt="Fondo Registro Mantenimiento"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
        <div className="registro-mantenimiento-container">
          <h1 className="titulo">Registro Orden de Mantenimiento</h1>
          <form className="formulario">
            {/* Campo: Motivo y Placa del Vehículo */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="motivo">Motivo Mantenimiento</label>
                <input type="text" id="motivo" name="motivo" placeholder="Motivo" required />
              </div>
              <div className="campo">
                <label htmlFor="placa">Placa vehículo</label>
                <select id="placa" name="placa" required>
                  <option value="">Seleccione placa...</option>
                  {vehiculos.map(v => (
                    <option key={v.id_vehiculo} value={v.id_vehiculo}>{v.placa}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo: Fechas */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="fechaInicio">Fecha inicio</label>
                <input type="date" id="fechaInicio" name="fechaInicio" required />
              </div>
              <div className="campo">
                <label htmlFor="fechaLimite">Fecha límite</label>
                <input type="date" id="fechaLimite" name="fechaLimite" required />
              </div>
            </div>

            {/* Campo: Mecánico y Tipo de Mantenimiento */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="mecanico">Mecánico Encargado</label>
                <select id="mecanico" name="mecanico" required>
                  <option value="">Seleccione mecánico...</option>
                  {mecanicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="tipoMantenimiento">Tipo de Mantenimiento</label>
                <select id="tipoMantenimiento" name="tipoMantenimiento" required>
                  <option value="">Seleccione tipo...</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="predictivo">Predictivo</option>
                </select>
              </div>
            </div>

            {/* Campo: Suministros */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="detalle">Detalle</label>
                <input type="text" id="detalle" name="detalle" placeholder="Detalle" />
              </div>
              <div className="campo">
                <label htmlFor="cantidad">Cantidad</label>
                <input type="number" id="cantidad" name="cantidad" placeholder="Cantidad" />
              </div>
              <div className="campo">
                <label htmlFor="precio">Precio</label>
                <input type="number" id="precio" name="precio" placeholder="Precio" />
              </div>
              <div className="campo">
                <label htmlFor="total">Total</label>
                <input type="number" id="total" name="total" placeholder="Total" readOnly />
              </div>
            </div>
            <button type="button" className="boton-agregar">
              Agregar suministro
            </button>

            {/* Campo: Observaciones */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea id="observaciones" name="observaciones" placeholder="Observaciones"></textarea>
              </div>
            </div>

            {/* Botón de envío */}
            <button type="submit" className="boton-crear">
              Crear Orden
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroMantenimiento;