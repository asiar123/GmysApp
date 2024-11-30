import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PosicionMapa.css";
import carIconImg from "../assets/car.png";

const fetchAddressFromProxy = async (lat, lng) => {
  try {
    const response = await fetch(`https://proxy-gmys.onrender.com/reverse-geocode?lat=${lat}&lon=${lng}`);
    const data = await response.json();
    if (data.address) {
      const road = data.address.road || "Sin calle";
      const town = data.address.town || data.address.city || "Sin ciudad";
      const state = data.address.state || "";
      const country = data.address.country || "";

      return `${road}, ${town}, ${state}, ${country}`;
    }
    return "Dirección no encontrada";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Error al obtener dirección";
  }
};

const PosicionMapa = () => {
  const { lat, lng } = useParams();
  const position = [parseFloat(lat), parseFloat(lng)];
  const [address, setAddress] = useState("Cargando dirección...");

  const icon = L.icon({
    iconUrl: carIconImg,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  useEffect(() => {
    const fetchAddress = async () => {
      const fetchedAddress = await fetchAddressFromProxy(lat, lng);
      setAddress(fetchedAddress); // Update address state
    };

    fetchAddress();
  }, [lat, lng]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={icon}>
          <Popup className="custom-popup">
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: "5px 0", fontSize: "1.2em", color: "#333" }}>Posición del vehículo</h3>
              <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#555" }}>{address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PosicionMapa;
