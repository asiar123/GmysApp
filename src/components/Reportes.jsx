import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { getVehicles } from "../services/authService";
import { Table, Pagination } from 'react-bootstrap'; // Importamos componentes de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './reportes.css';
import { Link } from 'react-router-dom'; // Importa Link para manejar la redirección

const Reportes = () => {
  const { usuarioId } = useContext(UserContext);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiId, setVehiId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [recorrido, setRecorrido] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await getVehicles(usuarioId);
        if (Array.isArray(response)) {
          setVehiculos(response);
        } else {
          console.error('La respuesta no es un array:', response);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error.message || error);
      }
    };

    if (usuarioId) {
      fetchVehiculos();
    }
  }, [usuarioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehiId || !fechaInicio || !fechaFin) {
      alert('Por favor, selecciona un vehículo y elige las fechas de inicio y fin.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('https://proxy-gmys.onrender.com/vehiculo_recorrido', {
        params: {
          vehi_id: vehiId,
          fecha_i: fechaInicio,
          fecha_f: fechaFin,
        },
      });
      console.log('Response: ',response);
      const recorridoData = response.data
        .filter((item) => item.position)
        .map((item) => {
          const [lat, lng] = item.position.replace(/[()]/g, '').split(',').map(Number);
          return {
            dia: item.dia,
            position: item.position,
            vehi_id: item.vehi_id,
            velocidad: item.velocidad,
            lat,
            lng,
          };
        });

      setRecorrido(recorridoData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al obtener el recorrido:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuración de paginación
  const itemsPerPage = 25;
  const totalPages = Math.ceil(recorrido.length / itemsPerPage);
  const displayedData = recorrido.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="reportes-container container mt-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Selecciona el Vehículo:</label>
            <select
              className="form-select"
              value={vehiId}
              onChange={(e) => setVehiId(e.target.value)}
              required
            >
              <option value="">Selecciona una placa</option>
              {vehiculos.map((vehiculo) => (
                <option key={vehiculo.vehi_id} value={vehiculo.vehi_id}>
                  {vehiculo.vehi_placa}
                </option>
              ))}
            </select>
          </div>
  
          <div className="col-md-4">
            <label className="form-label">Fecha de Inicio:</label>
            <input
              type="date"
              className="form-control"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
  
          <div className="col-md-4">
            <label className="form-label">Fecha de Fin:</label>
            <input
              type="date"
              className="form-control"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
        </div>
  
        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Ver Reporte
          </button>
        </div>
      </form>
  
      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        recorrido.length > 0 && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th className="text-center">Fecha</th>
                  <th className="text-center">Dirección</th>
                  <th className="text-center">Velocidad km</th>
                  <th className="text-center">Posición (Lat, Lng)</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">{item.dia}</td>
                    <td className="text-center">{item.position}</td>
                    <td className="text-center">{item.velocidad}</td>
                    <td className="text-center">
                      <Link to={`/posicion/${item.lat}/${item.lng}`} className="position-link">
                        <i className="fas fa-map-marker-alt"></i> {/* Icono de marcador */}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
  
            {/* Paginación */}
            <Pagination className="justify-content-center mt-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        )
      )}
    </div>
  );
  

};

export default Reportes;
