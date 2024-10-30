import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './PosicionMapa.css';
import carIconImg from '../assets/car.png';

const PosicionMapa = () => {
  const { lat, lng } = useParams();
  const position = [parseFloat(lat), parseFloat(lng)];
  const [address, setAddress] = useState('Cargando dirección...');

  const icon = L.icon({
    iconUrl: carIconImg,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Función para obtener la dirección usando la API de Nominatim
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
          params: {
            lat,
            lon: lng,
            format: 'json',
          },
        });
        const data = response.data;
        if (data && data.display_name) {
          setAddress(data.display_name); // Guardamos la dirección legible
        } else {
          setAddress('Dirección no disponible');
        }
      } catch (error) {
        console.error('Error al obtener la dirección:', error);
        setAddress('Error al obtener la dirección');
      }
    };

    fetchAddress();
  }, [lat, lng]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={icon}>
          <Popup className="custom-popup">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '5px 0', fontSize: '1.2em', color: '#333' }}>Posición del vehículo</h3>
              <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#555' }}>
                {address}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PosicionMapa;
