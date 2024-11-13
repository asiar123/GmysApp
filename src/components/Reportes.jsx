import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { getVehicles } from "../services/authService";
import { Table, Pagination, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './reportes.css';
import { Link } from 'react-router-dom';

const Reportes = () => {
  const { usuarioId } = useContext(UserContext);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiId, setVehiId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [recorrido, setRecorrido] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [addresses, setAddresses] = useState({}); // New state to cache addresses

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

  // Fetch address based on coordinates
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
        },
      });
      return response.data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Dirección no encontrada';
    }
  };

  // Fetch addresses for displayed coordinates
  useEffect(() => {
    const fetchAddresses = async () => {
      const newAddresses = { ...addresses };
      for (const item of displayedData) {
        const key = `${item.lat},${item.lng}`;
        if (!addresses[key]) {
          newAddresses[key] = await fetchAddress(item.lat, item.lng);
        }
      }
      setAddresses(newAddresses);
    };
    
    fetchAddresses();
  }, [recorrido, currentPage]);

  // Pagination setup
  const itemsPerPage = 25;
  const totalPages = Math.ceil(recorrido.length / itemsPerPage);
  const displayedData = recorrido.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="reportes-container container mt-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <h2 className="text-center custom-margin">Reportes</h2>
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
  
          <div className="row">
            <div className="col-6 col-md-6 mb-3">
              <label className="form-label">Fecha de Inicio:</label>
              <input
                type="date"
                className="form-control"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
  
            <div className="col-6 col-md-6 mb-3">
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
        </div>
  
        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Ver Reporte
          </button>
        </div>
      </form>
  
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        recorrido.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table table-striped table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center">Fecha</th>
                    <th className="text-center">Velocidad km</th>
                    <th className="text-center">Posición</th>
                    <th className="text-center">Posición (Lat, Lng)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center">{item.dia}</td>
                      <td className="text-center">{item.velocidad}</td>
                      <td className="text-center">
                        {addresses[`${item.lat},${item.lng}`] || 'Cargando...'}
                      </td>
                      <td className="text-center">
                        <Link to={`/posicion/${item.lat}/${item.lng}`} className="position-link">
                          <i className="fas fa-map-marker-alt"></i> {`(${item.lat}, ${item.lng})`}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            <div className="pagination-container">
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
          </div>
        ) : (
          <div className="text-center">
            <p>No se han encontrado reportes para las fechas seleccionadas.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Reportes;
