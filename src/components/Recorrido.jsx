import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Recorrido.css';
import carIcon from '../assets/car.png';

// Crear íconos personalizados
const startIcon = L.divIcon({
  className: "custom-start-icon",
  html: '<div style="background-color:red; width: 20px; height: 20px; border-radius: 50%;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const endIcon = L.icon({
  iconUrl: carIcon, // Usar la variable importada
  iconSize: [40, 40], // Tamaño del ícono
  iconAnchor: [20, 20], // Ancla del ícono
  popupAnchor: [0, -20], // Posición del popup
});

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

  // Configurar la fecha actual al cargar el componente
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
    setFechaFin(hoy);
    console.log("Fecha configurada:", hoy);
  }, []);

  // Función para extraer coordenadas de la cadena
  const extractCoordinates = (positionString) => {
    if (!positionString) return null;
    const [lat, lng] = positionString.replace(/[()]/g, '').split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  };

  // Función para obtener el recorrido del vehículo
  const fetchRecorrido = async () => {
    // Solo proceder si las fechas están asignadas
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      console.log("Enviando fechas:", fechaInicio, fechaFin);
      const response = await axios.get(`https://proxy-gmys.onrender.com/vehiculo_recorrido`, {
        params: {
          vehi_id: vehiId,
          fecha_i: fechaInicio,
          fecha_f: fechaFin,
        },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        const puntosValidos = data.filter((punto) => punto.position && punto.position.includes(','));
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

  // Solo llamar a fetchRecorrido si las fechas están configuradas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      setMostrarMapa(true);
      fetchRecorrido();
    }
  }, [fechaInicio, fechaFin]);

  // Generar las coordenadas para la línea del recorrido
  const lineCoordinates = recorrido
    .map((punto) => extractCoordinates(punto.position))
    .filter(Boolean);

  return (
    <div className="recorrido-container">
      <h1 className="text-2xl font-bold mb-4">Recorrido del Vehículo {vehiId}</h1>

      {/* Renderizar el mapa si el recorrido está disponible */}
      {loading ? <p>Cargando...</p> : mostrarMapa && lineCoordinates.length > 0 && (
        <MapContainer
          key={vehiId}
          center={lineCoordinates[0]}
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
