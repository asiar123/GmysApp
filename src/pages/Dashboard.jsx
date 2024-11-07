import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles(usuarioId);
        if (Array.isArray(response)) {
          setData(response);
        } else {
          console.error('La respuesta no es un array:', response);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos:', error.message || error);
        setLoading(false);
      }
    };

    if (usuarioId) {
      fetchVehicles();
    } else {
      console.error('Usuario ID no encontrado en localStorage');
      setLoading(false);
    }
  }, [usuarioId]);

  const handleVerRecorrido = (vehiId) => {
    navigate(`/recorrido/${vehiId}`);
  };

  function formatFecha(fecha) {
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
  }

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
                  </div>
                  <div className="card-header">
                    <span className="placa">{vehiculo.vehi_placa || 'Sin placa'}</span>
                  </div>
                  <div className="card-body">
                    <p className="ubicacion">{vehiculo.descripcion || 'Ubicación no disponible'}</p>
                  </div>
                  <div className="card-body">
                    <p className="fecha">{formatFecha(vehiculo.fecha)}</p>
                  </div>
                  <div className="card-footer">
                    <img
                      src={iconoVerRecorrido}
                      alt="Ver Recorrido"
                      className="icono-ver-recorrido"
                      onClick={() => handleVerRecorrido(vehiculo.vehi_id)}
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
