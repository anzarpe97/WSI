import React, { useState } from 'react';
import Header from '../header';
import '../../styles/RegistroDocumentosVehiculo.css'; // Archivo CSS para los estilos
import bgImage from '../../assets/bg-login.jpg'; 

const RegistroDocumentosVehiculos = () => {
  console.log('🔸 RegistroDocumentosVehiculos renderizado'); // Log para indicar que el componente fue renderizado


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
    // lógica para enviar datos
  };

  return (
    <div className="home-wrapper">

            <Header title="WSI" />


      <div className="registro-documentos-wrapper">
        <div className="registro-documentos-content">
          <div className="registro-documentos-bg">
            <img
              src={bgImage}
              alt="Fondo Registro Documentos Vehículo"
              onError={(e) => (e.target.style.display = 'none')}
            />
          </div>

          <div className="registro-documentos-container">
            <h1 className="registro-documentos-title">Registro Documentos Vehículo</h1>
            <form className="registro-documentos-form" onSubmit={handleSubmit}>
              
              <section className="registro-documentos-section">
                <h2 className="registro-documentos-sectionTitle">Datos del Vehículo</h2>
                
                <div className="registro-documentos-field">
                  <label htmlFor="placa">Placa</label>
                  <div className="placa-search-container">
                    <input
                      type="text"
                      id="placa"
                      name="placa"
                      placeholder="Placa vehículo"
                      value={form.placa}
                      onChange={handleChange}
                      required
                    />
                    {/* Aquí se podría agregar un botón de búsqueda si es necesario */}
                  </div>
                </div>
              </section>

              <section className="registro-documentos-section">
                <h2 className="registro-documentos-sectionTitle">Información de Documentos</h2>
                
                <div className="registro-documentos-row">
                  <div className="registro-documentos-field">
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
                  <div className="registro-documentos-field">
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

                <div className="registro-documentos-row">
                  <div className="registro-documentos-field">
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
                  <div className="registro-documentos-field">
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

                <div className="registro-documentos-row">
                  <div className="registro-documentos-field">
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
                  <div className="registro-documentos-field">
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

                <div className="registro-documentos-row">
                  <div className="registro-documentos-field">
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
              </section>

              <div className="registro-documentos-actions">
                <button type="submit" className="registro-documentos-submitBtn">
                  Guardar documentos
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroDocumentosVehiculos;