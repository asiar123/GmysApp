import React from "react";

const MapControls = ({ animating, handlePlayClick, pauseAnimation, handleGoToLastPosition, handleGoToFirstPosition }) => (
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
);

export default MapControls;
