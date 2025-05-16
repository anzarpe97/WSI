import React from "react";
import "../styles/RegistroEmpleado.css"; // Archivo CSS para los estilos
import bgImage from '../assets/bg-login.jpg'; // Verifica que esta imagen exista

const RegistroEmpleado = () => {
  

  return (
    <div className="home-wrapper">
      <header className="RegistroEmpleado-header">
        <h1>WSI</h1>
      </header>

      <div className="registro-empleado-wrapper">
        <div className="registro-empleado-bg">
          <img src={bgImage} alt="Fondo Registro Empleado" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="registro-empleado-container">
          <h1 className="titulo">Registro Empleado</h1>
          <form className="formulario">
            <div className="fila">
              <div className="campo">
                <label htmlFor="nombre">Nombre </label>
                <input type="text" id="nombre" name="nombre" />
              </div>
              <div className="campo">
                <label htmlFor="apellido">Apellido </label>
                <input type="text" id="apellido" name="apellido" />
              </div>
            </div>
            <div className="fila">
              <div className="campo">
                <label htmlFor="cedula">Cédula </label>
                <select id="cedula" name="cedula">
                  <option value="V">V</option>
                  <option value="E">E</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="n-cedula">Numero Cedula </label>
                <input type="text" id="n-cedula" name="n-cedula" />
              </div>
              <div className="campo">
                <label htmlFor="telefono">Teléfono </label>
                <input type="tel" id="telefono" name="telefono" />
              </div>
            </div>
            <div className="fila">
              <div className="campo">
                <label htmlFor="cargo">Cargo </label>
                <select id="cargo" name="cargo">
                  <option value="">Seleccione</option>
                  <option value="admin">Administrador</option>
                  <option value="chofer">Chofer</option>
                  <option value="operador">Operador</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="fechaIngreso">Fecha de ingreso</label>
                <input type="date" id="fechaIngreso" name="fechaIngreso" />
              </div>
            </div>
            <div className="fila">
              <div className="campo">
                <label htmlFor="correo">Correo electronico</label>
                <input type="email" id="correo" name="correo" />
              </div>
            </div>
            <button type="submit" className="boton-registrar">
              Registrar empleado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroEmpleado;