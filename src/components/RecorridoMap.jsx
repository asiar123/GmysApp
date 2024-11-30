import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useRef } from "react";
import { useMapAnimation } from "../hooks/useMapAnimation";
import CustomMarkers from "./CustomMarkers";
import MapControls from "./MapControls";
import ProgressBar from "./ProgressBar";
import HandleMapEvents from "./HandleMapEvents"; // Import the component
import L from "leaflet";
import carIcon from "../assets/car_thicker_bubble.png";
import "./RecorridoMap.css";

const RecorridoMap = ({ recorrido, lineCoordinates, extractCoordinates, formatFecha }) => {
  const markerRef = useRef(null);
  const { animating, progress, animateRoute, pauseAnimation } = useMapAnimation(lineCoordinates, markerRef);

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

  const handleGoToLastPosition = () => {
    const map = markerRef.current._map;
    const lastCoords = lineCoordinates[lineCoordinates.length - 1];
    if (map && lastCoords) {
      map.flyTo(lastCoords, 18, { animate: true });
    }
  };

  const handleGoToFirstPosition = () => {
    const map = markerRef.current._map;
    const firstCoords = lineCoordinates[0];
    if (map && firstCoords) {
      map.flyTo(firstCoords, 18, { animate: true });
    }
  };

  return (
    <>
      <MapContainer center={lineCoordinates[0]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <HandleMapEvents /> {/* Use the imported component */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Polyline positions={lineCoordinates} color="blue" weight={2} />
        <MarkerClusterGroup>
          <CustomMarkers recorrido={recorrido} extractCoordinates={extractCoordinates} formatFecha={formatFecha} startIcon={startIcon} />
        </MarkerClusterGroup>
        <Marker position={lineCoordinates[0]} icon={carMarkerIcon} ref={markerRef} />
      </MapContainer>
      <MapControls
        animating={animating}
        handlePlayClick={animateRoute}
        pauseAnimation={pauseAnimation}
        handleGoToLastPosition={handleGoToLastPosition}
        handleGoToFirstPosition={handleGoToFirstPosition}
      />
      <ProgressBar progress={progress} />
    </>
  );
};

export default RecorridoMap;
