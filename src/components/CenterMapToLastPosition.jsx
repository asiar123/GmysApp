const CenterMapToLastPosition = ({ coordinates }) => {
    const map = useMap(); // Usa el contexto del mapa de react-leaflet
  
    const goToLastPosition = () => {
      if (coordinates.length > 0) {
        const lastCoordinate = coordinates[coordinates.length - 1];
        map.flyTo(lastCoordinate, 18); // Centra el mapa suavemente en la última posición
      }
    };
  
    return (
      <button
        className="go-to-last-btn"
        onClick={goToLastPosition}
        style={{
          margin: "10px auto",
          padding: "10px 20px",
          backgroundColor: "#1ABC9C",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: "block",
        }}
      >
        Ir a la Última Posición
      </button>
    );
  };
  