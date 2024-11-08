import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Recorrido.css';
import carIcon from '../assets/car_thicker_bubble.png';
import { useMap } from 'react-leaflet';
import './Recorrido.css'

// Crear ícono de inicio (punto rojo)
const startIcon = L.divIcon({
  className: "custom-start-icon",
  html: '<div style="background-color:#1ABC9C; width: 15px; height: 15px; border-radius: 50%;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Crear ícono de fin (vehículo con imagen personalizada)
const endIcon = L.icon({
  iconUrl: carIcon,
  iconSize: [25, 25], // Aumenta el tamaño del ícono para destacarlo
  iconAnchor: [25, 25], // Centra el ícono
  popupAnchor: [0, -25],
});

// Crear ícono predeterminado para puntos intermedios (punto azul)
const customPin = L.divIcon({
  className: "custom-pin-icon",
  html: '<div style="background-color:blue; width: 15px; height: 15px; border-radius: 50%;"></div>',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5],
  popupAnchor: [0, -7.5],
});

// Objeto de caché para almacenar coordenadas y direcciones
const direccionCache = {};

// Función para obtener la dirección desde la API de OpenCage, con caché
const getDireccion = async (lat, lng) => {
  const key = `${lat},${lng}`;

  if (direccionCache[key]) {
    return direccionCache[key];
  }

  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: `${lat},${lng}`,
        key: '9691c74304904ebaaadedff2a9f25f2f', // Reemplaza aquí con tu clave completa de OpenCage
        limit: 1,
      },
    });
    const direccion = response.data.results[0]?.formatted || 'Dirección no disponible';
    direccionCache[key] = direccion;
    return direccion;
  } catch (error) {
    console.error('Error al obtener la dirección:', error);
    return 'Dirección no disponible';
  }
};

const formatFecha = (fechaString) => {
  // Reemplaza el guion bajo con un espacio para que el formato sea compatible
  const fechaNormalizada = fechaString.replace('_', ' ');

  const fecha = new Date(fechaNormalizada);

  // Verifica si la fecha es válida
  if (isNaN(fecha.getTime())) {
    console.warn("Fecha inválida:", fechaString);
    return "Fecha no disponible";
  }

  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return fecha.toLocaleDateString('es-ES', opciones);
};

// New component to center the map at the last coordinate
const CenterMap = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const lastCoordinate = coordinates[coordinates.length - 1]; // Get the last coordinate
      map.setView(lastCoordinate, 18); // Center the map at the last coordinate with a zoom level of 13
    }
  }, [coordinates, map]);

  return null;
};

const lowSpeedIcon = L.divIcon({
  className: "custom-low-speed-icon",
  html: '<div style="background-color:#F39C12; width: 10px; height: 10px; border-radius: 50%;"></div>',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5],
  popupAnchor: [0, -7.5],
});

const highSpeedIcon = L.divIcon({
  className: "custom-high-speed-icon",
  html: '<div style="background-color:blue; width: 10px; height: 10px; border-radius: 50%;"></div>',
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

  // Función para obtener el recorrido del vehículo y las direcciones
  const fetchRecorrido = async () => {
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      console.log("Enviando fechas:", fechaInicio, fechaFin);
      const response = await axios.get('https://proxy-gmys.onrender.com/vehiculo_recorrido', {
        params: {
          vehi_id: vehiId,
          fecha_i: fechaInicio,
          fecha_f: fechaFin,
        },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        const puntosValidos = await Promise.all(data.map(async (punto) => {
          if (punto.position && punto.position.includes(',')) {
            const coordinates = extractCoordinates(punto.position);
            if (coordinates) {
              const direccion = await getDireccion(coordinates[0], coordinates[1]);
              return { ...punto, direccion }; // Agrega la dirección al punto
            }
          }
          return punto;
        }));
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
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Recorrido del Vehículo {vehiId}
        </h1>
        {/* Renderizar el mapa si el recorrido está disponible */}
        {loading ? (
          <p>Cargando...</p>
        ) : (
          mostrarMapa && lineCoordinates.length > 0 && (
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
              <CenterMap coordinates={lineCoordinates} /> {/* Center the map on the route */}
              <Polyline positions={lineCoordinates} color="blue" weight={1} />
    
              {/* In your Recorrido component */}
              {recorrido.map((punto, index) => {
                const coordinates = extractCoordinates(punto.position);
                const isFirstPoint = index === 0;
                const isLastPoint = index === recorrido.length - 1;
    
                if (coordinates) {
                  let markerIcon;
    
                  // Change the marker icon based on the speed
                  if (punto.velocidad <= 10) { // Example threshold for low speed
                    markerIcon = lowSpeedIcon;
                  } else {
                    markerIcon = highSpeedIcon;
                  }
    
                  return (
                    <Marker
                      key={index}
                      position={coordinates}
                      icon={isFirstPoint ? startIcon : isLastPoint ? endIcon : markerIcon}
                      zIndexOffset={isFirstPoint ? 2000 : isLastPoint ? 1000 : 0}
                    >
                      <Popup>
                        Velocidad: {parseFloat(punto.velocidad).toFixed(1)} km/h
                        <br />
                        Fecha: {formatFecha(punto.dia)}
                        <br />
                        Dirección: {punto.direccion || 'Cargando dirección...'}
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          )
        )}
    
        {loading && (
          <div className="text-2xl font-bold mb-4 text-center text-white">
            Cargando recorrido...
          </div>
        )}
        {!loading && recorrido.length === 0 && mostrarMapa && (
          <div className="text-2xl font-bold mb-4 text-center text-white">
            No hay datos de recorrido disponibles.
          </div>
        )}
      </div>
    );
    
}

export default Recorrido;
