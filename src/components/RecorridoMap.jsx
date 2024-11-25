import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import "leaflet/dist/leaflet.css";
import "./RecorridoMap.css";
import carIcon from "../assets/car_thicker_bubble.png";

const CenterMap = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const lastCoordinate = coordinates[coordinates.length - 1];
      map.setView(lastCoordinate, 18);
    }
  }, [coordinates, map]);

  return null;
};

const HandleCenterEvent = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    const handleCenterMap = (event) => {
      const { position } = event.detail;
      if (position) {
        map.setView(position, 18);
      }
    };

    window.addEventListener("centrarMapa", handleCenterMap);

    return () => {
      window.removeEventListener("centrarMapa", handleCenterMap);
    };
  }, [map]);

  return null;
};

const RecorridoMap = ({ recorrido, lineCoordinates, extractCoordinates, formatFecha }) => {
  const markerRef = useRef(null);
  const intervalRef = useRef(null);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const carMarkerIcon = L.icon({
    iconUrl: carIcon,
    iconSize: [35, 35],
    iconAnchor: [17.5, 35],
    popupAnchor: [0, -30],
  });

  const startIcon = L.divIcon({
    className: "custom-start-icon",
    html: '<div style="background-color:#1ABC9C; width: 15px; height: 15px; border-radius: 50%;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });

  const animateRoute = () => {
    if (animating || lineCoordinates.length < 2) {
      console.warn("No se puede iniciar la animación: ya está en progreso o no hay suficientes coordenadas.");
      return;
    }

    const map = markerRef.current._map;
    let currentIndex = 0;

    setAnimating(true);

    intervalRef.current = setInterval(() => {
      if (currentIndex >= lineCoordinates.length) {
        clearInterval(intervalRef.current);
        setAnimating(false);
        setProgress(100);

        Swal.fire({
          icon: "success",
          title: "Recorrido completado",
          showConfirmButton: false,
          timer: 1500,
        });

        return;
      }

      const nextCoords = lineCoordinates[currentIndex];
      if (markerRef.current) {
        markerRef.current.setLatLng(nextCoords);
        map.flyTo(nextCoords, 15, { animate: true, duration: 0.5 });
      }

      setProgress(((currentIndex + 1) / lineCoordinates.length) * 100);
      currentIndex++;
    }, 1000);
  };

  const handlePlayClick = () => {
    Swal.fire({
      title: "¿Quieres reproducir el recorrido?",
      text: "Esto iniciará la animación del vehículo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, reproducir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Cargando recorrido...",
          html: '<div style="display: flex; align-items: center; justify-content: center;"><div style="width: 24px; height: 24px; border: 3px solid #3498db; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>',
          allowOutsideClick: false,
          showConfirmButton: false,
          timer: 2000,
          didOpen: () => {
            Swal.showLoading();
          },
        }).then(() => {
          animateRoute();
        });
      }
    });
  };

  const pauseAnimation = () => {
    clearInterval(intervalRef.current);
    setAnimating(false);
  };

  const handleGoToLastPosition = () => {
    const map = markerRef.current._map;
    const lastCoords = lineCoordinates[lineCoordinates.length - 1];
    if (map && lastCoords) {
      map.flyTo(lastCoords, 18, { animate: true });
    }
  };

  const handleGoToFirstPosition = () => {
    const map = markerRef.current._map;
    const firstCoords = lineCoordinates[0]; // Primera posición
    if (map && firstCoords) {
      map.flyTo(firstCoords, 18, { animate: true });
    }
  };
  

  return (
    <>
      <MapContainer center={lineCoordinates[0]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <CenterMap coordinates={lineCoordinates} />
        <HandleCenterEvent />
        <Polyline positions={lineCoordinates} color="blue" weight={2} />
        <MarkerClusterGroup>
          {recorrido.map((punto, index) => {
            const coordinates = extractCoordinates(punto.position);
            const isFirstPoint = index === 0;

            if (coordinates) {
              const markerIcon = isFirstPoint
                ? startIcon
                : L.divIcon({
                    className: "custom-numbered-icon",
                    html: `<div style="background-color: ${
                      punto.velocidad === 0 ? "gray" : punto.velocidad <= 10 ? "#F39C12" : "blue"
                    }; width: 20px; height: 20px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${index + 1}</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    popupAnchor: [0, -10],
                  });

              return (
                <Marker
                  key={index}
                  position={coordinates}
                  icon={markerIcon}
                  ref={isFirstPoint ? markerRef : null}
                >
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
                      <strong>Reporte:</strong> {index + 1} / {recorrido.length}
                      <br />
                      <strong>Velocidad:</strong> {parseFloat(punto.velocidad).toFixed(1)} km/h
                      <br />
                      <strong>Fecha:</strong> {formatFecha(punto.dia)}
                      <br />
                      <strong>Dirección:</strong> {punto.direccion || "Cargando dirección..."}
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MarkerClusterGroup>
        <Marker position={lineCoordinates[0]} icon={carMarkerIcon} ref={markerRef} />
      </MapContainer>
      <div className="botones-container">
  <button className="ir-a-inicio-btn" onClick={animating ? pauseAnimation : handlePlayClick}>
    {animating ? "⏸️" : "▶️"}
  </button>
  <button className="ir-a-ultima-posicion-btn" onClick={handleGoToLastPosition}>
    📍
  </button>
  <button className="ir-a-primera-posicion-btn" onClick={handleGoToFirstPosition}>
    🚩
  </button>
</div>

      <div className="progreso-barra">
        <div className="progreso" style={{ width: `${progress}%` }}></div>
      </div>
    </>
  );
};

export default RecorridoMap;
