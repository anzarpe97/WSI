export const verifyToken = async () => {
  const token = localStorage.getItem('token'); // O como lo guardes

  if (!token) {
    console.warn("No se encontró el token");
    return { isValid: false };
  }

  try {
    const response = await fetch('http://localhost:8000/api/verify-token/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante si usas sesiones
    });

    if (!response.ok) {
      console.warn("Respuesta inválida:", response.status);
      return { isValid: false };
    }

    const data = await response.json();
    //console.log("✅ Datos del usuario:", data.user);
    return {
      isValid: true,
      user: data.user
    };
  } catch (error) {
    console.error("Error verificando token:", error);
    return { isValid: false };
  }
};
