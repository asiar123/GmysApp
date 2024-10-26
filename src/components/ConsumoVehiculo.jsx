import React, { useState } from 'react';
import axios from 'axios';

const ConsumoVehiculo = ({ vehiId }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [consumo, setConsumo] = useState([]);
  const [error, setError] = useState(null);

  const PRECIO_GALON_GASOLINA = 13500; // Precio en COP
  const CONSUMO_PROMEDIO_KM_POR_GALON = 30; // Ejemplo: 30 km por galón

  const consultarConsumo = async () => {
    try {
      setError(null); // Resetear errores anteriores
      const response = await axios.get('https://proxy-gmys.onrender.com/consumo_vehiculo', {
        params: {
          vehi_id: vehiId,
          fecha_i: fechaInicio,
          fecha_f: fechaFin,
        },
      });
      setConsumo(response.data);
    } catch (error) {
      setError('Error al consultar el consumo');
      console.error(error);
    }
  };

  const calcularCosto = (kilometros) => {
    const galonesUsados = kilometros / CONSUMO_PROMEDIO_KM_POR_GALON;
    const costo = galonesUsados * PRECIO_GALON_GASOLINA;
    return costo.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };  

  return (
    <div className="consumo-container">
      <h2>Consultar Consumo</h2>
      <div className="input-group mb-3">
        <label>Fecha Inicio:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="input-group mb-3">
        <label>Fecha Fin:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="form-control"
        />
      </div>
      <button onClick={consultarConsumo} className="btn btn-primary">Consultar Consumo</button>
      {error && <p className="text-danger">{error}</p>}
      {consumo.length > 0 && (
        <div className="resultados-consumo mt-4">
          <h3>Resultados de Consumo</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Placa</th>
                <th>Recorrido (km)</th>
                <th>GPS ID</th>
                <th>Costo Estimado</th>
              </tr>
            </thead>
            <tbody>
              {consumo.map((item, index) => (
                <tr key={index}>
                  <td>{item["3"]}</td>
                  <td>{item.placa}</td>
                  <td>{item.recorrido}</td>
                  <td>{item.gps_id}</td>
                  <td>{calcularCosto(item.recorrido)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsumoVehiculo;
