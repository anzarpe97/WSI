import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { 
  faChartPie, faChartBar, faChartLine, faCar, faWrench, faGasPump, 
  faGaugeHigh, faCarSide, faGears, faClock, faDollarSign, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../../services/auth';
import Header from '../header';
import bgImage from '../../assets/bg-login.jpg';
import '../../styles/Estadisticas.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Estadisticas = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: '', apellido: '' });
  const [loading, setLoading] = useState(true);
  
  // Datos de ejemplo para gráficos (en un sistema real, estos vendrían de una API)
  const [stats, setStats] = useState({
    vehiculosPorEstado: [],
    tiposCombustible: [],
    kilometrajeFlota: {},
    distribucionMarcas: [],
    capacidadCarga: [],
    mantenimientosFrecuentes: [],
    mantenimientosPorTipo: [],
    historialMantenimientos: [],
    tiemposResolucion: {},
    estadoMantenimientos: [],
    costosMantenimientos: []
  });

  // Colores para gráficos
  const COLORS = ['#FF6A00', '#36A2EB', '#4CAF50', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0', '#F7464A', '#949FB1', '#D4CCC5'];

  useEffect(() => {
    document.title = "WSI - Estadísticas";
    
    const checkAuth = async () => {
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
              navigate('/login', { replace: true });
            }
            return;
          }
          setUser({
            nombre: result.user.nombre,
            apellido: result.user.apellido
          });
          
          // Simular carga de datos estadísticos
          setTimeout(() => {
            setStats({
              vehiculosPorEstado: [
                { name: 'Activo', value: 42 },
                { name: 'Inactivo', value: 15 },
                { name: 'En Mantenimiento', value: 8 }
              ],
              tiposCombustible: [
                { name: 'Gasolina', value: 35 },
                { name: 'Diésel', value: 25 },
                { name: 'Híbrido', value: 8 },
                { name: 'Eléctrico', value: 2 }
              ],
              kilometrajeFlota: {
                promedio: 12500,
                maximo: 87000
              },
              distribucionMarcas: [
                { marca: 'Toyota', cantidad: 12 },
                { marca: 'Ford', cantidad: 8 },
                { marca: 'Chevrolet', cantidad: 7 },
                { marca: 'Nissan', cantidad: 6 },
                { marca: 'Volkswagen', cantidad: 4 }
              ],
              capacidadCarga: [
                { tipo: 'Pickup', capacidad: 1.5 },
                { tipo: 'Camión Ligero', capacidad: 3.2 },
                { tipo: 'Furgón', capacidad: 2.8 },
                { tipo: 'Camión Pesado', capacidad: 15.0 }
              ],
              mantenimientosFrecuentes: [
                { vehiculo: 'Ford F-150', mantenimientos: 8 },
                { vehiculo: 'Toyota Hilux', mantenimientos: 7 },
                { vehiculo: 'Chevrolet Silverado', mantenimientos: 6 },
                { vehiculo: 'Nissan Frontier', mantenimientos: 5 },
                { vehiculo: 'Volkswagen Amarok', mantenimientos: 4 }
              ],
              mantenimientosPorTipo: [
                { name: 'Preventivo', value: 65 },
                { name: 'Correctivo', value: 25 },
                { name: 'Predictivo', value: 10 }
              ],
              historialMantenimientos: [
                { mes: 'Ene', cantidad: 12 },
                { mes: 'Feb', cantidad: 15 },
                { mes: 'Mar', cantidad: 18 },
                { mes: 'Abr', cantidad: 14 },
                { mes: 'May', cantidad: 20 },
                { mes: 'Jun', cantidad: 22 }
              ],
              tiemposResolucion: {
                promedio: 2.5,
                maximo: 7
              },
              estadoMantenimientos: [
                { name: 'Activos', value: 8 },
                { name: 'Finalizados', value: 32 },
                { name: 'Pendientes', value: 5 },
                { name: 'Cancelados', value: 3 }
              ],
              costosMantenimientos: [
                { mes: 'Ene', costo: 4200 },
                { mes: 'Feb', costo: 5800 },
                { mes: 'Mar', costo: 3500 },
                { mes: 'Abr', costo: 6200 },
                { mes: 'May', costo: 7800 },
                { mes: 'Jun', costo: 4500 }
              ]
            });
            setLoading(false);
          }, 1000);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error verificando token:", error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  // Componente para mostrar estadísticas en tarjetas
  const StatCard = ({ icon, title, value, unit, description }) => (
    <div className="stat-card">
      <div className="stat-icon">
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

      <div className="estadisticas-content">
        <div className="estadisticas-header">
        </div>

        <div className="stats-overview">
          <StatCard 
            icon={faCar} 
            title="Total Vehículos" 
            value={65} 
            unit="unidades"
            description="Flota total operativa"
          />
          <StatCard 
            icon={faWrench} 
            title="Mantenimientos" 
            value={48} 
            unit="este año"
            description="Mantenimientos realizados"
          />
          <StatCard 
            icon={faDollarSign} 
            title="Costo Promedio" 
            value={245} 
            unit="USD/mes"
            description="Por vehículo"
          />
          <StatCard 
            icon={faClock} 
            title="Tiempo Resolución" 
            value={2.5} 
            unit="días"
            description="Promedio mantenimientos"
          />
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faCar} /> Distribución de Vehículos por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.vehiculosPorEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.vehiculosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faGasPump} /> Tipos de Combustible</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.tiposCombustible}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad" fill="#FF6A00" />
              </BarChart>
            </ResponsiveContainer>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faChartLine} /> Historial de Mantenimientos</h2>
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

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faDollarSign} /> Costos de Mantenimiento</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.costosMantenimientos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Costo']} />
                <Legend />
                <Bar dataKey="costo" name="Costo (USD)" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2><FontAwesomeIcon icon={faWrench} /> Vehículos con Más Mantenimientos</h2>
            <div className="top-vehicles">
              {stats.mantenimientosFrecuentes.map((item, index) => (
                <div key={index} className="vehicle-item">
                  <span className="vehicle-rank">{index + 1}</span>
                  <span className="vehicle-name">{item.vehiculo}</span>
                  <span className="vehicle-count">{item.mantenimientos} mantenimientos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="home-bg">
        <img src={bgImage} alt="Fondo Home" onError={(e) => (e.target.style.display = 'none')} />
      </div>
    </div>
  );
};

export default Estadisticas;