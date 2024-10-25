import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from "../services/authService";
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const usuarioId = localStorage.getItem('usuario_id');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles(usuarioId);
        console.log('Datos de la respuesta:', response);

        if (Array.isArray(response)) {
          setData(response);
          console.log('Data actualizada:', response);
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

  return (
    <div className="dashboard-container">
      <div className="container-table">
        <h1 className="text-center mb-4">Vehículos del Usuario</h1>
  
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Placa</th>
                <th>Velocidad</th>
                <th>Última ubicación</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((vehiculo) => (
                  <tr key={vehiculo.vehi_id}>
                    <td>{vehiculo.vehi_placa || 'Sin placa'}</td>
                    <td>{vehiculo.velocidad !== null ? `${vehiculo.velocidad.toFixed(1)} km/h` : 'Velocidad desconocida'}</td>
                    <td>{vehiculo.descripcion || 'Ubicación no disponible'}</td>
                    <td>{vehiculo.fecha || 'Fecha no disponible'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleVerRecorrido(vehiculo.vehi_id)}
                      >
                        Ver Recorrido
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No se han cargado los datos aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
  
}

export default Dashboard;
