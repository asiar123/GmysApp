import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from "../services/authService";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import iconoVerRecorrido from '../assets/custom_pin4.png';
import locationGif from '../assets/searching.gif';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const usuarioId = localStorage.getItem('usuario_id');
  const addressCache = new Map(); // Para caché de direcciones

  // Función reutilizable para obtener direcciones desde coordenadas
  const fetchAddressFromCoordinates = useCallback(async (lat, lng) => {
    const key = `${lat},${lng}`;
    if (addressCache.has(key)) {
      return addressCache.get(key); // Usar caché si está disponible
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const address = data.display_name || 'Ubicación no disponible';
      addressCache.set(key, address); // Guardar en caché
      return address;
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      return 'Ubicación no disponible';
    }
  }, []);

  // Función para cargar vehículos
  const fetchVehicles = useCallback(async () => {
    if (!usuarioId) {
      console.error('Usuario ID no encontrado en localStorage');
      setLoading(false);
      return;
    }

    try {
      const response = await getVehicles(usuarioId);
      if (!Array.isArray(response)) {
        console.error('La respuesta no es un array:', response);
        setLoading(false);
        return;
      }

      const vehiclesWithAddresses = await Promise.all(
        response.map(async (vehiculo) => {
          if (vehiculo.position) {
            const [lat, lng] = vehiculo.position.replace(/[()]/g, '').split(',');
            const address = await fetchAddressFromCoordinates(lat, lng);
            return { ...vehiculo, ubicacion: address };
          }
          return { ...vehiculo, ubicacion: 'Ubicación no disponible' };
        })
      );

      setData(vehiclesWithAddresses);
    } catch (error) {
      console.error('Error al obtener los datos:', error.message || error);
    } finally {
      setLoading(false);
    }
  }, [usuarioId, fetchAddressFromCoordinates]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleVerRecorrido = (vehiId, vehiPlaca) => {
    localStorage.setItem('lastVehiclePlaca', vehiPlaca); // Guardar la placa en localStorage
    console.log('ID:', vehiId, 'Placa:', vehiPlaca); // Verifica que los valores sean correctos
    navigate(`/recorrido/${vehiId}`, { state: { placa: vehiPlaca } }); // Enviar la placa en el estado
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const fechaNormalizada = fecha.replace(/_/g, ' ');
    const date = new Date(fechaNormalizada);
    if (isNaN(date.getTime())) return 'Fecha no disponible';

    const formattedDate = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-center mb-4 custom-margin">Mis Vehículos</h1>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="scrollable-container">
          <div className="card-container">
            {data.length > 0 ? (
              data.map((vehiculo) => ( 
                <div key={vehiculo.vehi_id} className="vehicle-card horizontal">
                  <div className="card-header">
                    <span className="placa">{vehiculo.vehi_placa || 'Sin placa'}</span>
                  </div>
                  <div className="card-body">
                    <p className="velocidad">
                      <span
                        className={`status-indicator ${vehiculo.velocidad > 0 ? 'green' : 'red'}`}
                        title={vehiculo.velocidad > 0 ? 'En movimiento' : 'Detenido'}
                      ></span>
                      {vehiculo.velocidad !== null
                        ? `${vehiculo.velocidad.toFixed(1)} km/h`
                        : 'Velocidad desconocida'}
                    </p>
                    <p className="ubicacion">{vehiculo.ubicacion}</p>
                    <p className="fecha">{formatFecha(vehiculo.fecha)}</p>
                  </div>
                  <div className="card-footer">
                    <img
                      src={iconoVerRecorrido}
                      alt="Ver Recorrido"
                      className="icono-ver-recorrido"
                      aria-label={`Ver recorrido del vehículo ${vehiculo.vehi_placa}`}
                      onClick={() => handleVerRecorrido(vehiculo.vehi_id, vehiculo.vehi_placa)} // Pasa ID y placa
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">No se han cargado los datos aún.</p>
            )}
          </div>
        </div>
      )}

      <div className="gps-animation">
        <img src={locationGif} alt="GPS Animation" />
      </div>
    </div>
  );
}

export default Dashboard;
