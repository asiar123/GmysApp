import React from "react";

const ProgressBar = ({ progress }) => (
  <div className="progreso-barra">
    <div className="progreso" style={{ width: `${progress}%` }}></div>
  </div>
);

export default ProgressBar;
