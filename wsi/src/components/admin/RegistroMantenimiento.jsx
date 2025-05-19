import React from "react";
import "../styles/RegistroMantenimiento.css"; // Archivo CSS para los estilos
import bgImage from '../assets/bg-login.jpg'; // Verifica que esta imagen exista
import { faBell, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RegistroMantenimiento = () => {
  console.log('🔸 RegistroMantenimiento renderizado'); // Log para indicar que el componente fue renderizado

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="registro-header">
        <h1>WSI</h1>
        <div className="header-icons">
                  <FontAwesomeIcon icon={faBell} size="lg" className="header-icon" />
                  <FontAwesomeIcon icon={faUser} size="lg" className="header-icon" />
                  <FontAwesomeIcon icon={faSignOutAlt} size="lg" className="header-icon" />
                </div>
      </header>

      {/* Fondo */}
      <div className="registro-mantenimiento-wrapper">
        <div className="registro-mantenimiento-bg">
          <img
            src={bgImage}
            alt="Fondo Registro Mantenimiento"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>

        {/* Contenedor del formulario */}
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
                <input type="text" id="placa" name="placa" placeholder="Placa" required />
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
                <input type="text" id="mecanico" name="mecanico" placeholder="Mecánico" required />
              </div>
              <div className="campo">
                <label htmlFor="tipoMantenimiento">Tipo de Mantenimiento</label>
                <select id="tipoMantenimiento" name="tipoMantenimiento" required>
                  <option value="">Seleccione tipo...</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
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