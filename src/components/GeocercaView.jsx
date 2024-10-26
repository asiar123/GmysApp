import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { getVehicles } from '../services/authService';
import axios from 'axios';

const API_URL = 'https://proxy-gmys.onrender.com';

// Configuración de un ícono personalizado para un punto rojo pequeño
const redDotIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Basic_red_dot.png/600px-Basic_red_dot.png', // URL de un punto rojo
  iconSize: [10, 10], // Tamaño del ícono
  iconAnchor: [5, 5], // Ancla en el centro del ícono
  popupAnchor: [0, -5] // Ajuste para el popup
});

const fetchGeocercaPlaca = async (vehiculoId) => {
  try {
    const response = await axios.get(`${API_URL}/geocerca_placa?vehi_id=${vehiculoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching geocerca data:", error);
    throw error;
  }
};

const GeocercaView = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [geocercas, setGeocercas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);

  useEffect(() => {
    const fetchVehiculos = async () => {
      const usuarioId = localStorage.getItem('usuario_id');
      if (usuarioId) {
        try {
          const vehicles = await getVehicles(usuarioId);
          setVehiculos(vehicles);
        } catch (error) {
          console.error("Error loading vehicles:", error);
        } finally {
          setLoadingVehiculos(false);
        }
      }
    };
    fetchVehiculos();
  }, []);

  useEffect(() => {
    if (selectedVehiculo) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await fetchGeocercaPlaca(selectedVehiculo);
          const geocercasConPuntos = data.map((item) => ({
            ...item,
            puntos: JSON.parse(item.puntos),
          }));
          setGeocercas(geocercasConPuntos);
        } catch (error) {
          console.error("Error loading geocercas", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedVehiculo]);

  const handleSelectChange = (event) => {
    setSelectedVehiculo(event.target.value);
    setGeocercas([]);
  };

  if (loadingVehiculos) return <p>Cargando lista de vehículos...</p>;

  const initialPosition = geocercas.length > 0 ? [geocercas[0].puntos[0][0].jb, geocercas[0].puntos[0][0].kb] : [1.1914157476327092, -77.24133253097287];
  const zoomLevel = 10;

  return (
    <div>
      <h1>Geocercas de Vehículos</h1>
      <select value={selectedVehiculo} onChange={handleSelectChange} style={{ padding: '10px', margin: '10px 0', width: '100%' }}>
        <option value="">Selecciona un vehículo</option>
        {vehiculos.map((vehiculo) => (
          <option key={vehiculo.vehi_id} value={vehiculo.vehi_id}>
            {vehiculo.veh_placa ? `${vehiculo.veh_placa} (ID: ${vehiculo.vehi_id})` : `ID: ${vehiculo.vehi_id}`}
          </option>
        ))}
      </select>

      {selectedVehiculo && (
        <div>
          {loading ? (
            <p>Cargando geocercas...</p>
          ) : (
            <div>
              <MapContainer center={initialPosition} zoom={zoomLevel} style={{ height: "500px", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {geocercas.map((geocerca, index) => (
                  <React.Fragment key={index}>
                    {/* Franja de la geocerca con relleno */}
                    <Polygon
                      positions={geocerca.puntos[0].map(p => [p.jb, p.kb])}
                      pathOptions={{
                        color: "blue",
                        fillColor: "red",
                        fillOpacity: 0.4,
                      }}
                    />
                    {geocerca.puntos[0].map((punto, idx) => (
                      <Marker position={[punto.jb, punto.kb]} key={idx} icon={redDotIcon}>
                        <Popup>
                          {geocerca.nombre}<br />
                          Lat: {punto.jb}, Lon: {punto.kb}
                        </Popup>
                      </Marker>
                    ))}
                  </React.Fragment>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeocercaView;
