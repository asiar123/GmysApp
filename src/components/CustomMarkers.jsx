import React, { useState, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet"; // Ensure Leaflet is properly imported

// Helper function to calculate distance between two coordinates
const calculateDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

const MIN_DISTANCE = 5; // Minimum distance to consider movement (in meters)

// Custom hook for fetching addresses
const useGeocodeAddresses = (recorrido, extractCoordinates) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchAllAddresses = async () => {
      const uniqueCoordinates = Array.from(
        new Set(
          recorrido.map((punto) => {
            const coordinates = extractCoordinates(punto.position);
            return coordinates ? `${coordinates[0]},${coordinates[1]}` : null;
          })
        )
      ).filter((coord) => coord);

      if (uniqueCoordinates.length === 0) return;

      try {
        const response = await axios.post("https://proxy-gmys.onrender.com/batch-geocode", {
          locations: uniqueCoordinates.map((coord) => {
            const [lat, lon] = coord.split(",");
            return { lat, lon };
          }),
        });

        const addressMap = response.data; // Map { "lat,lon": "address" }
        const fetchedAddresses = recorrido.map((punto) => {
          const coordinates = extractCoordinates(punto.position);
          if (coordinates) {
            const key = `${coordinates[0]},${coordinates[1]}`;
            return addressMap[key] || "Dirección no disponible";
          }
          return "Dirección no disponible";
        });

        setAddresses(fetchedAddresses);
      } catch (error) {
        console.error("Error fetching addresses:", error.message);
        setAddresses(recorrido.map(() => "Error al cargar dirección"));
      }
    };

    fetchAllAddresses();
  }, [recorrido, extractCoordinates]);

  return addresses;
};

// Function to aggregate stationary points
const aggregateStationaryPoints = (recorrido, extractCoordinates) => {
  const aggregatedPoints = [];
  let currentCluster = [];
  let previousCoordinates = null;

  recorrido.forEach((punto, index) => {
    const coordinates = extractCoordinates(punto.position);
    if (!coordinates) return;

    if (previousCoordinates) {
      const distance = calculateDistance(previousCoordinates, coordinates);
      if (distance < MIN_DISTANCE && punto.velocidad === 0) {
        // Add to current cluster if within distance threshold and speed is 0
        currentCluster.push(punto);
        return;
      }
    }

    // Finalize the current cluster if it exists
    if (currentCluster.length > 0) {
      aggregatedPoints.push({
        ...currentCluster[0], // Use the first point's data
        duration: currentCluster.length, // Add duration (number of points in cluster)
      });
    }

    // Start a new cluster
    currentCluster = [punto];
    previousCoordinates = coordinates;
  });

  // Add the last cluster
  if (currentCluster.length > 0) {
    aggregatedPoints.push({
      ...currentCluster[0],
      duration: currentCluster.length,
    });
  }

  return aggregatedPoints;
};

// Main CustomMarkers component
const CustomMarkers = ({ recorrido, extractCoordinates, formatFecha, startIcon }) => {
  const addresses = useGeocodeAddresses(recorrido, extractCoordinates);

  // Aggregate stationary points
  const aggregatedRecorrido = aggregateStationaryPoints(recorrido, extractCoordinates);

  return (
    <>
      {aggregatedRecorrido.map((punto, index) => {
        const coordinates = extractCoordinates(punto.position);
        const isFirstPoint = index === 0;

        if (coordinates) {
          const markerIcon = isFirstPoint
            ? startIcon
            : L.divIcon({
                className: "custom-numbered-icon",
                html: `<div style="background-color: ${
                  punto.velocidad === 0 ? "gray" : punto.velocidad <= 10 ? "#F39C12" : "blue"
                }; width: 20px; height: 20px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${
                  index + 1
                }</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -10],
              });

          return (
            <Marker key={index} position={coordinates} icon={markerIcon}>
              <Popup>
                <div style={{ padding: "10px", fontSize: "14px", color: "#333" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: punto.velocidad === 0 ? "red" : "green",
                      display: "inline-block",
                      marginRight: "5px",
                    }}
                  ></div>
                  <strong>Reporte:</strong> {index + 1} / {aggregatedRecorrido.length}
                  <br />
                  <strong>Velocidad:</strong> {parseFloat(punto.velocidad).toFixed(1)} km/h
                  <br />
                  <strong>Fecha:</strong> {formatFecha(punto.dia)}
                  <br />
                  <strong>Duración:</strong>{" "}
                  {punto.duration ? `${punto.duration} reportes` : "N/A"}
                  <br />
                  <strong>Dirección:</strong> {addresses[index] || "Cargando dirección..."}
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </>
  );
};

export default CustomMarkers;
