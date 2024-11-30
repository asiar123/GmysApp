import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export const useMapAnimation = (lineCoordinates, markerRef) => {
  const intervalRef = useRef(null);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const animateRoute = () => {
    if (animating || lineCoordinates.length < 2) {
      console.warn("Cannot start animation: already in progress or not enough coordinates.");
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
          title: "Route completed",
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

  const pauseAnimation = () => {
    clearInterval(intervalRef.current);
    setAnimating(false);
  };

  return { animating, progress, animateRoute, pauseAnimation };
};
