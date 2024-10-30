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
      const response = await axios.get(`https://proxy-gmys.onrender.com/eventos_placa`, {
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
            fecha: item.fecha,
            placa: item.placa,
            vehi_id: item.vehi_id,
            descripcion: item.descripcion,
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
    <div className="reportes-container">
      <h1 className="text-2xl font-bold mb-4">Reportes de Vehículos</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <label>
          Selecciona el Vehículo:
          <select value={vehiId} onChange={(e) => setVehiId(e.target.value)} required>
            <option value="">Selecciona una placa</option>
            {vehiculos.map((vehiculo) => (
              <option key={vehiculo.vehi_id} value={vehiculo.vehi_id}>
                {vehiculo.vehi_placa}
              </option>
            ))}
          </select>
        </label>
        <label className="ml-4">
          Fecha de Inicio:
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        </label>
        <label className="ml-4">
          Fecha de Fin:
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
        </label>
        <br></br>
        <button type="submit" className="centrar-boton">
          Ver Reporte
        </button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Placa</th>
                <th>Descripción</th>
                <th>Posición (Lat, Lng)</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.fecha}</td>
                  <td>{item.placa}</td>
                  <td>{item.descripcion}</td>
                  <td>
                    <Link to={`/posicion/${item.lat}/${item.lng}`}>
                      ({item.lat}, {item.lng})
                    </Link>
                  </td>                </tr>
              ))}
            </tbody>
          </Table>

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
      )}
    </div>
  );
};

export default Reportes;
