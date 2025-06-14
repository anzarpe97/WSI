import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, faChartBar, faChartLine, faCar, faWrench, faGasPump, 
  faGaugeHigh, faCarSide, faGears, faClock, faDollarSign, faUserCog, 
  faCheckCircle, faExclamationTriangle, faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../../services/auth';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/Estadisticas.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#FF6A00', '#36A2EB', '#4CAF50', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0', '#F7464A', '#949FB1', '#D4CCC5'];

const Estadisticas = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: '', apellido: '' });
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  // Datos de vehículos y mantenimientos
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [topVehiculos, setTopVehiculos] = useState([]);

  // Estadísticas calculadas
  const [stats, setStats] = useState({
    vehiculosPorEstado: [],
    tiposCombustible: [],
    kilometrajeFlota: {},
    distribucionMarcas: [],
    capacidadCarga: [],
    totalMantenimientos: 0,
    mantenimientosPorEstado: [],
    mantenimientosPorTipo: [],
    mantenimientosPorVehiculo: [],
    historialMantenimientos: [],
    tiempoResolucion: {},
    mantenimientosPorMecanico: [],
    mantenimientosPorMotivo: [],
    culminadosATiempo: 0,
    retrasados: 0,
    gastosMensuales: [],
    promedioGastoMantenimiento: 0
  });

  useEffect(() => {
    document.title = "WSI - Estadísticas";
    const checkAuthAndFetch = async () => {
      try {
        const result = await verifyToken();
        if (result.isValid && result.user) {
          if (String(result.user.rol) !== "0") {
            if (String(result.user.rol) === "1") {
              navigate('/supervisorHome', { replace: true });
            } else if (String(result.user.rol) === "2") {
              navigate('/employee-dashboard', { replace: true });
            } else {
              navigate('/login', { replace: true });
            }
            return;
          }
          setUser({
            nombre: result.user.nombre,
            apellido: result.user.apellido
          });

          // Obtener vehículos, mantenimientos y top vehículos con más mantenimientos
          const token = localStorage.getItem('token');
          const [vehiculosRes, mantenimientosRes, topVehiculosRes] = await Promise.all([
            fetch('http://localhost:8000/api/vehiculos/', {
              headers: { 'Authorization': `Token ${token}` }
            }),
            fetch('http://localhost:8000/api/mantenimientos/', {
              headers: { 'Authorization': `Token ${token}` }
            }),
            fetch('http://localhost:8000/api/vehiculos-mas-mantenimientos/', {
              headers: { 'Authorization': `Token ${token}` }
            })
          ]);
          const vehiculosData = await vehiculosRes.json();
          const mantenimientosData = await mantenimientosRes.json();
          const topVehiculosData = await topVehiculosRes.json();
          setVehiculos(vehiculosData);
          setMantenimientos(mantenimientosData);
          setTopVehiculos(topVehiculosData);

          // ---- Estadísticas de vehículos ----
          // Por estado
          const estados = {};
          vehiculosData.forEach(v => {
            const estado = v.estado || 'Desconocido';
            estados[estado] = (estados[estado] || 0) + 1;
          });
          const vehiculosPorEstado = Object.entries(estados).map(([name, value]) => ({ name, value }));

          // Por tipo de combustible
          const combustibles = {};
          vehiculosData.forEach(v => {
            const tipo = v.tipo_combustible || 'Desconocido';
            combustibles[tipo] = (combustibles[tipo] || 0) + 1;
          });
          const tiposCombustible = Object.entries(combustibles).map(([name, value]) => ({ name, value }));

          // Por marca
          const marcas = {};
          vehiculosData.forEach(v => {
            const marca = v.marca || 'Desconocido';
            marcas[marca] = (marcas[marca] || 0) + 1;
          });
          const distribucionMarcas = Object.entries(marcas).map(([marca, cantidad]) => ({ marca, cantidad }));

          // Capacidad de carga (si existe el campo)
          let capacidadCarga = [];
          if (vehiculosData.some(v => v.capacidad_carga && v.tipo)) {
            const tipos = {};
            vehiculosData.forEach(v => {
              if (v.tipo && v.capacidad_carga) {
                if (!tipos[v.tipo]) tipos[v.tipo] = [];
                tipos[v.tipo].push(Number(v.capacidad_carga));
              }
            });
            capacidadCarga = Object.entries(tipos).map(([tipo, capacidades]) => ({
              tipo,
              capacidad: (capacidades.reduce((a, b) => a + b, 0) / capacidades.length).toFixed(2)
            }));
          }

          // Kilometraje (si existe el campo)
          let kilometrajes = vehiculosData.map(v => Number(v.kilometraje)).filter(km => !isNaN(km));
          const kilometrajeFlota = {
            promedio: kilometrajes.length ? Math.round(kilometrajes.reduce((a, b) => a + b, 0) / kilometrajes.length) : 0,
            maximo: kilometrajes.length ? Math.max(...kilometrajes) : 0
          };

          // ---- Estadísticas de mantenimientos ----
          // Total
          const totalMantenimientos = mantenimientosData.length;

          // Por estado
          const estadosMant = {};
          mantenimientosData.forEach(m => {
            const estado = m.estado || 'Desconocido';
            estadosMant[estado] = (estadosMant[estado] || 0) + 1;
          });
          const mantenimientosPorEstado = Object.entries(estadosMant).map(([name, value]) => ({ name, value }));

          // Por tipo
          const tiposMant = {};
          mantenimientosData.forEach(m => {
            const tipo = m.tipo_mantenimiento || 'Desconocido';
            tiposMant[tipo] = (tiposMant[tipo] || 0) + 1;
          });
          const mantenimientosPorTipo = Object.entries(tiposMant).map(([name, value]) => ({ name, value }));

          // Por vehículo (usando id)
          const mantPorVehiculo = {};
          mantenimientosData.forEach(m => {
            const id = m.vehiculo?.id || m.id_vehiculo?.id || m.vehiculo || m.id_vehiculo || 'Desconocido';
            mantPorVehiculo[id] = (mantPorVehiculo[id] || 0) + 1;
          });
          const mantenimientosPorVehiculo = Object.entries(mantPorVehiculo).map(([id, cantidad]) => ({ id, cantidad }));

          // Historial por mes (últimos 12 meses)
          const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const historial = {};
          mantenimientosData.forEach(m => {
            if (m.fecha_programada) {
              const fecha = new Date(m.fecha_programada);
              const mes = meses[fecha.getMonth()];
              historial[mes] = (historial[mes] || 0) + 1;
            }
          });
          const historialMantenimientos = meses.map(mes => ({
            mes,
            cantidad: historial[mes] || 0
          }));

          // Tiempo de resolución (promedio y máximo en días)
          let tiempos = [];
          mantenimientosData.forEach(m => {
            if (m.fecha_programada && (m.fecha_finalizado || m.fecha_terminado)) {
              const inicio = new Date(m.fecha_programada);
              const fin = new Date(m.fecha_finalizado || m.fecha_terminado);
              const diff = (fin - inicio) / (1000 * 60 * 60 * 24);
              if (!isNaN(diff) && diff >= 0) tiempos.push(diff);
            }
          });
          const tiempoResolucion = {
            promedio: tiempos.length ? (tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(2) : 0,
            maximo: tiempos.length ? Math.max(...tiempos).toFixed(2) : 0
          };

          // Por mecánico
          const mantPorMecanico = {};
          mantenimientosData.forEach(m => {
            const mecanico = m.mecanico?.nombre ? `${m.mecanico.nombre} ${m.mecanico.apellido}` : 'Desconocido';
            mantPorMecanico[mecanico] = (mantPorMecanico[mecanico] || 0) + 1;
          });
          const mantenimientosPorMecanico = Object.entries(mantPorMecanico).map(([mecanico, cantidad]) => ({ mecanico, cantidad }));

          // Por motivo
          const mantPorMotivo = {};
          mantenimientosData.forEach(m => {
            const motivo = m.motivo || 'Desconocido';
            mantPorMotivo[motivo] = (mantPorMotivo[motivo] || 0) + 1;
          });
          const mantenimientosPorMotivo = Object.entries(mantPorMotivo).map(([motivo, cantidad]) => ({ motivo, cantidad }));

          // --- Mantenimientos culminados a tiempo y retrasados ---
          let culminadosATiempo = 0;
          let retrasados = 0;
          mantenimientosData.forEach(m => {
            if (m.fecha_finalizado && m.fecha_terminado && m.estado === "FINALIZADO") {
              const fechaFinalizado = new Date(m.fecha_finalizado);
              const fechaTerminado = new Date(m.fecha_terminado);
              if (fechaTerminado <= fechaFinalizado) {
                culminadosATiempo += 1;
              } else {
                retrasados += 1;
              }
            }
          });

          // --- GASTOS POR MES Y PROMEDIO ---
          const gastosPorMes = Array(12).fill(0);
          let totalGasto = 0;
          let totalConCosto = 0;
          mantenimientosData.forEach(m => {
            const costo = Number(m.costo_total);
            if (
              m.fecha_terminado &&
              !isNaN(costo) &&
              costo > 0
            ) {
              const fecha = new Date(m.fecha_terminado);
              const mesIdx = fecha.getMonth();
              gastosPorMes[mesIdx] += costo;
              totalGasto += costo;
              totalConCosto += 1;
            }
          });
          const gastosMensuales = meses.map((mes, idx) => ({
            mes,
            gasto: gastosPorMes[idx]
          }));
          const promedioGastoMantenimiento = totalConCosto > 0 ? totalGasto / totalConCosto : 0;

          setStats({
            vehiculosPorEstado,
            tiposCombustible,
            kilometrajeFlota,
            distribucionMarcas,
            capacidadCarga,
            totalMantenimientos,
            mantenimientosPorEstado,
            mantenimientosPorTipo,
            mantenimientosPorVehiculo,
            historialMantenimientos,
            tiempoResolucion,
            mantenimientosPorMecanico,
            mantenimientosPorMotivo,
            culminadosATiempo,
            retrasados,
            gastosMensuales,
            promedioGastoMantenimiento
          });
          setLoading(false);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error verificando token o cargando datos:", error);
        navigate('/login');
      }
    };

    checkAuthAndFetch();
  }, [navigate]);

const generatePDF = () => {
  setGeneratingPDF(true);
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    
    // Función para agregar encabezado de sección
    const addSectionHeader = (title, y) => {
      pdf.setFontSize(16);
      pdf.setTextColor(255, 106, 0);
      pdf.text(title, margin, y);
      pdf.setDrawColor(255, 106, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y + 2, pageWidth - margin, y + 2);
      return y + 10;
    };
    
    // Función para agregar tabla usando jspdf-autotable
    const addTable = (headers, data, y) => {
      pdf.autoTable({
        startY: y,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { 
          fillColor: [255, 106, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        margin: { left: margin, right: margin }
      });
      return pdf.autoTable.previous.finalY + 10;
    };
    
    // Portada
    pdf.setFontSize(28);
    pdf.setTextColor(255, 106, 0);
    pdf.text('Reporte de Estadísticas', pageWidth / 2, 40, null, null, 'center');
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Flota Vehicular', pageWidth / 2, 60, null, null, 'center');
    
    const date = new Date().toLocaleDateString();
    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generado el: ${date}`, pageWidth / 2, 75, null, null, 'center');
    
    pdf.setFontSize(12);
    pdf.setTextColor(120, 120, 120);
    pdf.text('WSI - Sistema de Gestión de Flota', pageWidth / 2, 85, null, null, 'center');
    
    pdf.addPage();
    
    // Resumen ejecutivo
    let yPos = addSectionHeader('Resumen Ejecutivo', margin);
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    // Agregar estadísticas clave
    const summaryData = [
      { label: 'Total de Vehículos', value: vehiculos.length },
      { label: 'Mantenimientos Registrados', value: stats.totalMantenimientos },
      { label: 'Culminados a Tiempo', value: stats.culminadosATiempo },
      { label: 'Retrasados', value: stats.retrasados },
      { label: 'Gasto Promedio', value: `$${Number(stats.promedioGastoMantenimiento || 0).toFixed(2)}` },
      { label: 'Kilometraje Promedio', value: `${stats.kilometrajeFlota.promedio.toLocaleString()} km` },
      { label: 'Kilometraje Máximo', value: `${stats.kilometrajeFlota.maximo.toLocaleString()} km` }
    ];
    
    // Crear tabla de resumen
    const summaryTableData = summaryData.map(item => [item.label, item.value]);
    yPos = addTable(['Métrica', 'Valor'], summaryTableData, yPos);
    
    // Sección de vehículos
    yPos = addSectionHeader('Estadísticas de Vehículos', yPos);
    
    // Distribución por marca
    pdf.setFontSize(12);
    pdf.text('Distribución por Marca:', margin, yPos);
    yPos += 7;
    
    const marcasData = stats.distribucionMarcas.map(item => [item.marca, item.cantidad]);
    yPos = addTable(['Marca', 'Cantidad'], marcasData, yPos);
    
    // Vehículos por estado
    pdf.text('Vehículos por Estado:', margin, yPos);
    yPos += 7;
    
    const estadosData = stats.vehiculosPorEstado.map(item => [item.name, item.value]);
    yPos = addTable(['Estado', 'Cantidad'], estadosData, yPos);
    
    // Tipos de combustible
    pdf.text('Tipos de Combustible:', margin, yPos);
    yPos += 7;
    
    const combustiblesData = stats.tiposCombustible.map(item => [item.name, item.value]);
    yPos = addTable(['Combustible', 'Cantidad'], combustiblesData, yPos);
    
    if (stats.capacidadCarga.length > 0) {
      pdf.text('Capacidad de Carga Promedio por Tipo:', margin, yPos);
      yPos += 7;
      
      const capacidadData = stats.capacidadCarga.map(item => [item.tipo, `${item.capacidad} ton`]);
      yPos = addTable(['Tipo', 'Capacidad Promedio'], capacidadData, yPos);
    }
    
    // Sección de mantenimientos
    pdf.addPage();
    yPos = addSectionHeader('Estadísticas de Mantenimientos', margin);
    
    // Mantenimientos por estado
    pdf.setFontSize(12);
    pdf.text('Mantenimientos por Estado:', margin, yPos);
    yPos += 7;
    
    const mantEstadosData = stats.mantenimientosPorEstado.map(item => [item.name, item.value]);
    yPos = addTable(['Estado', 'Cantidad'], mantEstadosData, yPos);
    
    // Mantenimientos por tipo
    pdf.text('Mantenimientos por Tipo:', margin, yPos);
    yPos += 7;
    
    const mantTiposData = stats.mantenimientosPorTipo.map(item => [item.name, item.value]);
    yPos = addTable(['Tipo', 'Cantidad'], mantTiposData, yPos);
    
    // Mantenimientos por mecánico
    pdf.text('Mantenimientos por Mecánico:', margin, yPos);
    yPos += 7;
    
    const mecanicosData = stats.mantenimientosPorMecanico.map(item => [item.mecanico, item.cantidad]);
    yPos = addTable(['Mecánico', 'Cantidad'], mecanicosData, yPos);
    
    // Mantenimientos por motivo
    pdf.text('Mantenimientos por Motivo:', margin, yPos);
    yPos += 7;
    
    const motivosData = stats.mantenimientosPorMotivo.map(item => [item.motivo, item.cantidad]);
    yPos = addTable(['Motivo', 'Cantidad'], motivosData, yPos);
    
    // Historial mensual
    pdf.text('Historial Mensual de Mantenimientos:', margin, yPos);
    yPos += 7;
    
    const historialData = stats.historialMantenimientos.map(item => [item.mes, item.cantidad]);
    yPos = addTable(['Mes', 'Cantidad'], historialData, yPos);
    
    // Gastos mensuales
    pdf.text('Gastos Mensuales de Mantenimiento:', margin, yPos);
    yPos += 7;
    
    const gastosData = stats.gastosMensuales.map(item => [item.mes, `$${Number(item.gasto).toFixed(2)}`]);
    yPos = addTable(['Mes', 'Gasto'], gastosData, yPos);
    
    // Tiempo de resolución
    pdf.text('Tiempo de Resolución de Mantenimientos:', margin, yPos);
    yPos += 7;
    
    const tiempoData = [
      ['Promedio', `${stats.tiempoResolucion.promedio} días`],
      ['Máximo', `${stats.tiempoResolucion.maximo} días`]
    ];
    yPos = addTable(['Métrica', 'Valor'], tiempoData, yPos);
    
    // Vehículos con más mantenimientos
    pdf.addPage();
    yPos = addSectionHeader('Vehículos con Más Mantenimientos', margin);
    
    const topVehiculosData = topVehiculos.slice(0, 5).map((item, index) => [
      index + 1,
      item.placa,
      `${item.marca} ${item.modelo}`,
      item.cantidad_mantenimientos
    ]);
    
    yPos = addTable(['#', 'Placa', 'Vehículo', 'Mantenimientos'], topVehiculosData, yPos);
    
    // Análisis y recomendaciones
    yPos = addSectionHeader('Análisis y Recomendaciones', yPos + 10);
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    const analysisLines = [
      '1. Vehículos con alto kilometraje:',
      `   - El vehículo con mayor kilometraje (${stats.kilometrajeFlota.maximo.toLocaleString()} km) requiere atención prioritaria`,
      '2. Mantenimientos retrasados:',
      `   - Existen ${stats.retrasados} mantenimientos retrasados que requieren seguimiento`,
      '3. Distribución de gastos:',
      `   - El mes con mayor gasto fue ${stats.gastosMensuales.reduce((max, item) => item.gasto > max.gasto ? item : max, stats.gastosMensuales[0]).mes}`,
      '4. Eficiencia de mecánicos:',
      `   - El mecánico más productivo realizó ${Math.max(...stats.mantenimientosPorMecanico.map(m => m.cantidad))} mantenimientos`
    ];
    
    analysisLines.forEach(line => {
      pdf.text(line, margin, yPos);
      yPos += 7;
    });
    
    // Pie de página en cada página
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pdf.internal.pageSize.getHeight() - 10);
      pdf.text('WSI - Sistema de Gestión de Flota', margin, pdf.internal.pageSize.getHeight() - 10);
    }
    
    pdf.save(`reporte_estadisticas_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error("Error al generar PDF:", error);
  } finally {
    setGeneratingPDF(false);
  }
};

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  // Componente para mostrar estadísticas en tarjetas
  const StatCard = ({ icon, title, value, unit, description, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={color ? {color} : {}}>
        <FontAwesomeIcon icon={icon} size="2x" />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value} {unit}</p>
        <p className="stat-desc">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="home-wrapper">
      <Header title="WSI" />

      <div className="estadisticas-header-actions">
        <button 
          className="pdf-button"
          onClick={generatePDF}
          disabled={generatingPDF}
        >
          <FontAwesomeIcon icon={faFilePdf} />
          {generatingPDF ? ' Generando PDF...' : ' Exportar a PDF'}
        </button>
      </div>

      <div className="estadisticas-content" ref={reportRef}>
        <div className="estadisticas-header"></div>

        <div className="stats-overview">
          <StatCard 
            icon={faCar} 
            title="Total Vehículos" 
            value={vehiculos.length} 
            unit="unidades"
            description="Flota total operativa"
          />
          <StatCard 
            icon={faWrench} 
            title="Total Mantenimientos" 
            value={stats.totalMantenimientos} 
            unit=""
            description="Mantenimientos registrados"
          />
          <StatCard 
            icon={faCheckCircle}
            title="Culminados a Tiempo"
            value={stats.culminadosATiempo}
            unit=""
            description="Mantenimientos terminados antes o en la fecha prevista"
            color="#4CAF50"
          />
          <StatCard 
            icon={faExclamationTriangle}
            title="Retrasados"
            value={stats.retrasados}
            unit=""
            description="Mantenimientos terminados después de la fecha prevista"
            color="#FF6A00"
          />
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faDollarSign} /> Gastos de Mantenimiento por Mes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.gastosMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="gasto" name="Gasto ($)" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faDollarSign} /> Promedio de Gasto por Mantenimiento</h2>
            <div className="promedio-gasto">
              <div className="promedio-valor">
                ${Number(stats.promedioGastoMantenimiento || 0).toFixed(2)}
              </div>
              <p className="promedio-desc">
                Costo promedio por cada mantenimiento realizado
              </p>
            </div>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faGaugeHigh} /> Kilometraje de la Flota</h2>
            <div className="km-stats">
              <div className="km-stat">
                <h3>Promedio</h3>
                <p>{stats.kilometrajeFlota.promedio.toLocaleString()} km</p>
              </div>
              <div className="km-stat">
                <h3>Máximo</h3>
                <p>{stats.kilometrajeFlota.maximo.toLocaleString()} km</p>
              </div>
            </div>
            <p className="km-desc">El vehículo con mayor kilometraje requiere atención prioritaria</p>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faCarSide} /> Distribución por Marca</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={stats.distribucionMarcas} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="marca" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" name="Vehículos" fill="#36A2EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {stats.capacidadCarga.length > 0 && (
            <div className="chart-container">
              <h2><FontAwesomeIcon icon={faCarSide} /> Capacidad de Carga Promedio por Tipo</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.capacidadCarga}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="capacidad" name="Capacidad Promedio (toneladas)" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Estadísticas de mantenimientos */}
          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faGears} /> Mantenimientos por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.mantenimientosPorEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.mantenimientosPorEstado.map((entry, index) => (
                    <Cell key={`cell-mant-estado-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faGears} /> Mantenimientos por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.mantenimientosPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.mantenimientosPorTipo.map((entry, index) => (
                    <Cell key={`cell-mant-tipo-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faChartLine} /> Historial de Mantenimientos (por mes)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.historialMantenimientos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cantidad" name="Mantenimientos" stroke="#FF6A00" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vehículos con más mantenimientos usando la API */}
          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faWrench} /> Vehículos con Más Mantenimientos</h2>
            <div className="top-vehicles">
              {topVehiculos.slice(0, 5).map((item, index) => (
                <div key={item.id} className="vehicle-item">
                  <span className="vehicle-rank">{index + 1}</span>
                  <span className="vehicle-name">{item.placa} - {item.marca} {item.modelo}</span>
                  <span className="vehicle-count">{item.cantidad_mantenimientos} mantenimientos</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faUserCog} /> Mantenimientos por Mecánico</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.mantenimientosPorMecanico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mecanico" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" name="Mantenimientos" fill="#9966FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faChartBar} /> Mantenimientos por Motivo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.mantenimientosPorMotivo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="motivo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" name="Mantenimientos" fill="#FF6384" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overlay para generación de PDF */}
      {generatingPDF && (
        <div className="pdf-overlay">
          <div className="pdf-loader">
            <div className="loader"></div>
            <p>Generando reporte PDF...</p>
          </div>
        </div>
      )}

      <div className="home-bg">
        <img src={bgImage} alt="Fondo Home" onError={(e) => (e.target.style.display = 'none')} />
      </div>
    </div>
  );
};

export default Estadisticas;