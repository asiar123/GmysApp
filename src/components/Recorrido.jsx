import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import RecorridoMap from "./RecorridoMap";
import "./Recorrido.css";

const Recorrido = () => {
  const { vehiId } = useParams();
  const [recorrido, setRecorrido] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Estado del progreso
  const [direccionesCargadas, setDireccionesCargadas] = useState(false); // Si las direcciones están listas
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ultimaPosicion, setUltimaPosicion] = useState(null);

  const extractCoordinates = (positionString) => {
    if (!positionString) return null;
    const [lat, lng] = positionString.replace(/[()]/g, "").split(",").map(Number);
    return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
  };

  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString.replace("_", " "));
    return isNaN(fecha.getTime())
      ? "Fecha no disponible"
      : fecha.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const placa = location.state?.placa || localStorage.getItem("lastVehiclePlaca") || "Placa no disponible";

  const fetchRecorrido = async () => {
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      const response = await axios.get("https://proxy-gmys.onrender.com/vehiculo_recorrido", {
        params: { vehi_id: vehiId, fecha_i: fechaInicio, fecha_f: fechaFin },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        setRecorrido(data);

        const incremento = 100 / data.length;
        let progresoActual = 0;

        // Procesar direcciones utilizando el caché del proxy
        for (let i = 0; i < data.length; i++) {
          const coords = extractCoordinates(data[i].position);
          if (coords) {
            try {
              const direccion = await fetchAddressFromCache(coords); // Usar caché
              data[i].direccion = direccion || "Dirección no disponible";
            } catch (error) {
              console.error("Error al cargar dirección:", error);
              data[i].direccion = "Error al cargar dirección";
            }
          }
          progresoActual += incremento;
          setProgress(Math.min(progresoActual, 100));
        }

        setDireccionesCargadas(true); // Marcar las direcciones como cargadas
        const ultima = data.length > 0 ? extractCoordinates(data[data.length - 1].position) : null;
        setUltimaPosicion(ultima);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener el recorrido:", error);
      setLoading(false);
    }
  };

  const fetchAddressFromCache = async (coords) => {
    try {
      const response = await axios.get(`https://proxy-gmys.onrender.com/reverse-geocode`, {
        params: { lat: coords[0], lon: coords[1] },
      });
      return response.data.display_name || "Dirección no disponible";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Dirección no disponible";
    }
  };

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFechaInicio(hoy);
    setFechaFin(hoy);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      fetchRecorrido();
    }
  }, [fechaInicio, fechaFin]);

  const lineCoordinates = recorrido.map((punto) => extractCoordinates(punto.position)).filter(Boolean);

  return (
    <div className="recorrido-container">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        Recorrido del Vehículo {placa}
      </h1>
      {!direccionesCargadas ? (
        <div className="progress-bar-wrapper">
          <div className="loading-icon"></div>
          <p className="progress-text">Cargando datos: {Math.round(progress)}%</p>
        </div>
      ) : lineCoordinates.length > 0 ? (
        <RecorridoMap
          recorrido={recorrido}
          lineCoordinates={lineCoordinates}
          ultimaPosicion={ultimaPosicion}
          extractCoordinates={extractCoordinates}
          formatFecha={formatFecha}
        />
      ) : (
        <p className="text-center text-white">No hay datos de recorrido disponibles.</p>
      )}
    </div>
  );
};

export default Recorrido;
