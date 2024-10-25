import axios from 'axios';
import qs from 'qs';

// URL base del proxy alojado en Render
const API_URL = 'https://proxy-gmys.onrender.com';

// Función para manejar el login
export const login = async (username, password) => {
  try {
    // Usamos qs.stringify para formatear los datos como x-www-form-urlencoded
    const response = await axios.post(`${API_URL}/login`, 
      qs.stringify({
        usuario: username,
        passwd: password,
      }), 
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    // Verificar que la estructura tenga el `usuario_id` dentro de `mensaje`
    const usuarioId = response.data.mensaje?.usuario_id;
    if (usuarioId) {
      // Guardar solo el `usuario_id` en localStorage
      localStorage.setItem('usuario_id', usuarioId);
      return response.data; // Retornar los datos de la respuesta
    } else {
      throw new Error('No se encontró el usuario_id en la respuesta.');
    }
  } catch (error) {
    throw new Error('Error en el inicio de sesión. Credenciales incorrectas o error en el servidor.');
  }
};

// Función para obtener los vehículos del usuario
export const getVehicles = async (usuarioId) => {
  try {
    // Realizamos la solicitud al backend usando axios
    const response = await axios.get(`https://proxy-gmys.onrender.com/vehiculos_user?usuario_id=${usuarioId}`);
    
    // Registro completo de la respuesta para depuración
    console.log('Respuesta completa de la API de vehículos:', response);

    // Verificamos si la respuesta tiene el formato correcto y si es un array
    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data; // Si es un array, retornamos los vehículos
    } else if (response.data?.error) {
      // Si hay un error explícito en la respuesta
      throw new Error(`Error en el backend: ${response.data.error}`);
    } else {
      // Si la respuesta no es válida
      throw new Error('La respuesta no contiene una lista válida de vehículos.');
    }
  } catch (error) {
    // Mostramos el error completo en la consola para depuración
    console.error('Error al obtener los vehículos del usuario:', error);
    throw new Error('Error al obtener los vehículos del usuario. Intenta nuevamente más tarde.');
  }
};

