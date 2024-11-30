import { useEffect } from "react";
import { useMap } from "react-leaflet";

const HandleMapEvents = () => {
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

export default HandleMapEvents;
