// src/Pages/RegistroDocumentosVehiculo.jsx
import React, { useState } from 'react';
import '../styles/RegistroDocumentosVehiculo.css'; // Archivo CSS para los estilos
import bgImage from '../assets/bg-login.jpg'; // Verifica que esta imagen exista

const RegistroDocumentosVehiculo = () => {
  console.log('🔸 RegistroDocumentosVehiculo renderizado'); // Log para indicar que el componente fue renderizado

  // Estado inicial del formulario
  const [form, setForm] = useState({
    placa: '',
    soatNum: '',
    soatVenc: '',
    rtNum: '',
    rtVenc: '',
    polizaNum: '',
    polizaCompania: '',
    polizaVenc: '',
  });

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    console.log('Formulario enviado:', form);
    // Aquí puedes agregar lógica para enviar los datos a un servidor o realizar otras acciones
  };

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="registro-header">
        <h1>WSI</h1>
      </header>

      {/* Fondo */}
      <div className="registro-documentos-wrapper">
        <div className="registro-documentos-bg">
          <img
            src={bgImage}
            alt="Fondo Registro Documentos Vehículo"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>

        {/* Contenedor del formulario */}
        <div className="registro-documentos-container">
          <h1 className="titulo">Registro Documentos Vehículo</h1>
          <form className="formulario" onSubmit={handleSubmit}>
            {/* Campo: Placa */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="placa">Placa</label>
                <input
                  type="text"
                  id="placa"
                  name="placa"
                  placeholder="Placa vehículo"
                  value={form.placa}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Campo: SOAT */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="soatNum">SOAT N°</label>
                <input
                  type="text"
                  id="soatNum"
                  name="soatNum"
                  placeholder="SOAT N°"
                  value={form.soatNum}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="soatVenc">Vencimiento SOAT</label>
                <input
                  type="date"
                  id="soatVenc"
                  name="soatVenc"
                  value={form.soatVenc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Campo: Revisión Técnica */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="rtNum">R.T. N°</label>
                <input
                  type="text"
                  id="rtNum"
                  name="rtNum"
                  placeholder="R.T. N°"
                  value={form.rtNum}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="rtVenc">Vencimiento R.T.</label>
                <input
                  type="date"
                  id="rtVenc"
                  name="rtVenc"
                  value={form.rtVenc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Campo: Póliza de Seguro */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="polizaNum">Póliza seguro N°</label>
                <input
                  type="text"
                  id="polizaNum"
                  name="polizaNum"
                  placeholder="Póliza seguro N°"
                  value={form.polizaNum}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="polizaCompania">Compañía seguro</label>
                <input
                  type="text"
                  id="polizaCompania"
                  name="polizaCompania"
                  placeholder="Compañía seguro"
                  value={form.polizaCompania}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Campo: Vencimiento de Póliza */}
            <div className="fila">
              <div className="campo">
                <label htmlFor="polizaVenc">Vencimiento Póliza</label>
                <input
                  type="date"
                  id="polizaVenc"
                  name="polizaVenc"
                  value={form.polizaVenc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button type="submit" className="boton-registrar">
              Guardar documentos
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroDocumentosVehiculo;