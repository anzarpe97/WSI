export async function getVehiculos() {
  const token = localStorage.getItem('token'); // O donde guardes tu token
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  const response = await fetch('http://localhost:8000/api/vehiculos/', {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Error al obtener los vehículos');
  }
  return await response.json();
}