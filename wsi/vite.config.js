import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // O tu plugin específico (vue, angular, etc.)

export default defineConfig({
  plugins: [react()], // O tus plugins
  server: {
    host: '0.0.0.0', // Esto es lo importante: permite conexiones desde cualquier IP
    port: 5173,      // Asegúrate de que el puerto sea el 5173
    // open: true,    // Si quieres que se abra automáticamente en el navegador de la laptop
  },
});
