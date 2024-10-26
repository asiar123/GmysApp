import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { getVehicles } from '../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vehiculos = ({ onConsultarConsumo }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usuarioId, isAuthenticated } = useContext(UserContext);

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await getVehicles(usuarioId);
        console.log('Datos de la respuesta:', response);

        if (Array.isArray(response)) {
          setVehiculos(response);
          console.log('Vehículos cargados:', response);
        } else {
          console.error('La respuesta no es un array:', response);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error.message || error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && usuarioId) {
      fetchVehiculos();
    } else {
      console.error('El usuario no está autenticado o no se encontró el ID del usuario.');
      setLoading(false);
    }
  }, [usuarioId, isAuthenticated]);

  return (
    <div className="vehiculos-container">
      <h1 className="text-center mb-4">Listado de Vehículos</h1>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando vehículos...</span>
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
            {vehiculos.length > 0 ? (
              vehiculos.map((vehiculo) => (
                <tr key={vehiculo.vehi_id}>
                  <td>{vehiculo.vehi_placa || 'Sin placa'}</td>
                  <td>{vehiculo.velocidad !== null ? `${vehiculo.velocidad.toFixed(1)} km/h` : 'Desconocida'}</td>
                  <td>{vehiculo.descripcion || 'No disponible'}</td>
                  <td>{vehiculo.fecha || 'No disponible'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onConsultarConsumo(vehiculo.vehi_id)}
                    >
                      Consultar Consumo
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No se encontraron vehículos.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Vehiculos;
