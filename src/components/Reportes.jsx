import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { getVehicles } from "../services/authService";
import { Table, Pagination, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './reportes.css';
import { Link } from 'react-router-dom';

// Función para validar y corregir el formato de la fecha
const fixDateFormat = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    console.error('Fecha inválida o no definida:', dateString);
    return null; // Retorna null si la fecha no es válida
  }

  // Reemplazar "_" por espacio
  let [datePart, timePart] = dateString.split('_');
  
  if (!timePart) {
    console.error('Formato de fecha incompleto:', dateString);
    return null;
  }

  // Asegurar que los segmentos de tiempo tengan ceros iniciales
  const timeSegments = timePart.split(':').map((segment) => segment.padStart(2, '0'));
  const fixedTime = timeSegments.join(':');

  return `${datePart} ${fixedTime}`;
};

// Función para calcular promedios de tiempo encendido y apagado
const calculateAverages = (data) => {
  if (!data || data.length < 2) {
    return { averageOnTime: 0, averageOffTime: 0 };
  }

  let totalOnTime = 0; // Tiempo total encendido (en minutos)
  let totalOffTime = 0; // Tiempo total apagado (en minutos)

  for (let i = 1; i < data.length; i++) {
    const current = data[i - 1];
    const next = data[i];

    // Validar y corregir las fechas
    const currentDateString = fixDateFormat(current.dia);
    const nextDateString = fixDateFormat(next.dia);

    // Ignorar datos con fechas inválidas
    if (!currentDateString || !nextDateString) {
      console.error('Fechas no procesadas:', current, next);
      continue;
    }

    const currentDate = new Date(currentDateString);
    const nextDate = new Date(nextDateString);

    if (isNaN(currentDate) || isNaN(nextDate)) {
      console.error('Fechas no convertibles a Date:', currentDateString, nextDateString);
      continue;
    }

    // Calcular la diferencia en minutos
    const diff = (nextDate - currentDate) / 1000 / 60;

    if (current.velocidad > 0) {
      totalOnTime += diff;
    } else {
      totalOffTime += diff;
    }
  }

  // Verificar que la suma total coincida con el intervalo completo
  const firstDate = new Date(fixDateFormat(data[0].dia));
  const lastDate = new Date(fixDateFormat(data[data.length - 1].dia));
  const totalInterval = (lastDate - firstDate) / 1000 / 60; // Total en minutos

  console.log('Tiempo total calculado (minutos):', totalOnTime + totalOffTime);
  console.log('Tiempo total esperado (minutos):', totalInterval);

  // Calcular promedios
  const averageOnTime = totalOnTime.toFixed(2);
  const averageOffTime = totalOffTime.toFixed(2);

  return { averageOnTime, averageOffTime };
};


const Reportes = () => {
  const { usuarioId } = useContext(UserContext);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiId, setVehiId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [recorrido, setRecorrido] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [addresses, setAddresses] = useState({});
  const [formVisible, setFormVisible] = useState(true);

  // Función para formatear la fecha de manera legible
  const formatDateTime = (dateString) => {
    if (!dateString.includes('_')) return 'Fecha inválida';
    const [date, time] = dateString.split('_');
    const [year, month, day] = date.split('-');
    const [hours, minutes, seconds] = time.split(':');
    return `${day}/${month}/${year} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  };

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
    setFormVisible(false); // Oculta el formulario después del envío
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
            velocidad: item.velocidad || 0,
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

  const handleResetForm = () => {
    setFormVisible(true);
    setRecorrido([]);
  };

  const itemsPerPage = 25;
  const totalPages = Math.ceil(recorrido.length / itemsPerPage);
  const displayedData = recorrido.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const averages = calculateAverages(recorrido);

  // Verificación de datos
  useEffect(() => {
    console.log('Datos de recorrido:', recorrido.map((item) => fixDateFormat(item.dia)));
  }, [recorrido]);

  console.log('Datos procesados:', recorrido);
console.log('Promedio de tiempo encendido (min):', averages.averageOnTime);
console.log('Promedio de tiempo apagado (min):', averages.averageOffTime);


  return (
    <div className="reportes-container container mt-4">
      {formVisible ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <h2 className="text-center custom-margin">Reportes</h2>
          <div className="row mb-3 align-items-center">
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
      ) : (
        <div className="text-center">
          <button className="btn btn-secondary mb-3" onClick={handleResetForm}>
            Realizar otra búsqueda
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center margin-30">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        recorrido.length > 0 && (
          <div className="table-container">
            <div className="table-responsive">
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
                      <td className="text-center">{formatDateTime(item.dia)}</td>
                      <td className="text-center">{item.velocidad}</td>
                      <td className="text-center">{addresses[`${item.lat},${item.lng}`] || 'Cargando...'}</td>
                      <td className="text-center">
                        <Link to={`/posicion/${item.lat}/${item.lng}`}>
                          {`(${item.lat}, ${item.lng})`}
                        </Link>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="text-center" colSpan="2">Promedio de tiempo encendido (min)</td>
                    <td className="text-center" colSpan="2">{averages.averageOnTime}</td>
                  </tr>
                  <tr>
                    <td className="text-center" colSpan="2">Promedio de tiempo apagado (min)</td>
                    <td className="text-center" colSpan="2">{averages.averageOffTime}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pagination-container">
              <Pagination className="justify-content-center mt-3">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Reportes;
