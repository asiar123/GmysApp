import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Crear ícono de inicio (punto rojo)
const startIcon = L.divIcon({
  className: "custom-start-icon",
  html: '<div style="background-color:red; width: 20px; height: 20px; border-radius: 50%;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Crear ícono de fin (vehículo)
const endIcon = L.divIcon({
  className: "custom-end-icon",
  html: '<i class="fas fa-car" style="font-size: 30px; color:blue;"></i>',
  iconSize: [60, 60],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// Crear ícono predeterminado para puntos intermedios (punto azul)
const customPin = L.divIcon({
  className: "custom-pin-icon",
  html: '<div style="background-color:blue; width: 15px; height: 15px; border-radius: 50%;"></div>',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5],
  popupAnchor: [0, -7.5],
});

function Recorrido() {
  const { vehiId } = useParams();
  const [recorrido, setRecorrido] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Función para extraer coordenadas de la cadena
  const extractCoordinates = (positionString) => {
    if (!positionString) return null;
    const [lat, lng] = positionString.replace(/[()]/g, '').split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  };

  // Función para obtener el recorrido del vehículo
  const fetchRecorrido = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://proxy-gmys.onrender.com/vehiculo_recorrido`, {
        params: {
          vehi_id: vehiId,
          fecha_i: fechaInicio,
          fecha_f: fechaFin,
        },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        const puntosValidos = data.filter((punto) => punto.position);
        setRecorrido(puntosValidos);
      } else {
        console.error('La respuesta no es un array válido:', data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener el recorrido del vehículo:', error);
      setLoading(false);
    }
  };

  // Maneja el envío del formulario para obtener el recorrido
  const handleSubmit = (e) => {
    e.preventDefault();
    setMostrarMapa(true);
    fetchRecorrido();
  };

  // Generar las coordenadas para la línea del recorrido
  const lineCoordinates = recorrido.map((punto) => extractCoordinates(punto.position)).filter(Boolean);

  return (
    <div className="recorrido-container">
      <h1 className="text-2xl font-bold mb-4">Recorrido del Vehículo {vehiId}</h1>

      {/* Formulario para seleccionar fechas */}
      <form onSubmit={handleSubmit} className="mb-4">
        <label>
          Fecha de Inicio:
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </label>
        <label className="ml-4">
          Fecha de Fin:
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="ml-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
          Ver Recorrido
        </button>
      </form>

      {/* Renderizar el mapa si el recorrido está disponible */}
      {loading ? <p>Cargando...</p> : mostrarMapa && lineCoordinates.length > 0 && (
        <MapContainer
          key={vehiId}
          center={lineCoordinates[0]}  // Centrar el mapa en la primera coordenada
          zoom={13}
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Polyline positions={lineCoordinates} color="blue" weight={5} />

          {recorrido.map((punto, index) => {
            const coordinates = extractCoordinates(punto.position);
            const isFirstPoint = index === 0;
            const isLastPoint = index === recorrido.length - 1;

            if (coordinates) {
              return (
                <Marker
                  key={index}
                  position={coordinates}
                  icon={isFirstPoint ? startIcon : isLastPoint ? endIcon : customPin}
                >
                  <Popup>
                    Velocidad: {punto.velocidad} km/h
                    <br />
                    Fecha: {punto.dia}
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      )}

      {loading && <div>Cargando recorrido...</div>}
      {!loading && recorrido.length === 0 && mostrarMapa && <div>No hay datos de recorrido disponibles.</div>}
    </div>
  );
}

export default Recorrido;
