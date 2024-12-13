import React, { useState, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";

// Helper function to calculate distance
const calculateDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371e3;
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
  return R * c;
};

const MIN_DISTANCE = 5;

const useGeocodeAddresses = (recorrido, extractCoordinates, setLoadingAddresses) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchAllAddresses = async () => {
      setLoadingAddresses(true);

      const uniqueCoordinates = Array.from(
        new Set(
          recorrido.map((punto) => {
            const coordinates = extractCoordinates(punto.position);
            return coordinates ? `${coordinates[0]},${coordinates[1]}` : null;
          })
        )
      ).filter((coord) => coord);

      if (uniqueCoordinates.length === 0) {
        setAddresses([]);
        setLoadingAddresses(false);
        return;
      }

      try {
        const response = await axios.post("https://proxy-gmys.onrender.com/batch-geocode", {
          locations: uniqueCoordinates.map((coord) => {
            const [lat, lon] = coord.split(",");
            return { lat, lon };
          }),
        });

        const addressMap = response.data;
        const fetchedAddresses = recorrido.map((punto, i) => {
          const coordinates = extractCoordinates(punto.position);
          if (coordinates) {
            const key = `${coordinates[0]},${coordinates[1]}`;
            if (addressMap[key]) {
              return addressMap[key];
            } else {
              console.warn(`No se encontró dirección para el índice ${i}: ${key}`);
              return "Dirección no disponible";
            }
          }
          return "Dirección no disponible";
        });

        setAddresses(fetchedAddresses);
      } catch (error) {
        console.error("Error fetching addresses:", error.message);
        setAddresses(recorrido.map(() => "Error al cargar dirección"));
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAllAddresses();
  }, [recorrido, extractCoordinates, setLoadingAddresses]);

  return addresses;
};

const aggregateStationaryPoints = (recorrido, extractCoordinates) => {
  const aggregatedPoints = [];
  let currentCluster = [];
  let previousCoordinates = null;

  recorrido.forEach((punto) => {
    const coordinates = extractCoordinates(punto.position);
    if (!coordinates) return;

    if (previousCoordinates) {
      const distance = calculateDistance(previousCoordinates, coordinates);
      if (distance < MIN_DISTANCE && punto.velocidad === 0) {
        currentCluster.push(punto);
        return;
      }
    }

    if (currentCluster.length > 0) {
      aggregatedPoints.push({
        ...currentCluster[0],
        duration: currentCluster.length,
      });
    }

    currentCluster = [punto];
    previousCoordinates = coordinates;
  });

  if (currentCluster.length > 0) {
    aggregatedPoints.push({
      ...currentCluster[0],
      duration: currentCluster.length,
    });
  }

  return aggregatedPoints;
};

const CustomMarkers = ({ recorrido, extractCoordinates, formatFecha, startIcon }) => {
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const addresses = useGeocodeAddresses(recorrido, extractCoordinates, setLoadingAddresses);
  const aggregatedRecorrido = aggregateStationaryPoints(recorrido, extractCoordinates);

  useEffect(() => {
    console.log("Direcciones cargadas:", addresses);
    console.log("Recorrido agregado:", aggregatedRecorrido);
  }, [addresses, aggregatedRecorrido]);

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
                  <strong>Duración:</strong> {punto.duration ? `${punto.duration} reportes` : "N/A"}
                  <br />
                  <strong>Dirección:</strong>{" "}
                  {loadingAddresses ? "Cargando dirección..." : addresses[index] || "Dirección no disponible"}
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
