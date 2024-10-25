import React from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';  // Importa el Link de react-router-dom

function HomePage() {
  return (
    <div className="homepage-background" style={{ backgroundImage: `url(/fd.png)` }}>
      <Link to="/login" className="btn-iniciar">Iniciar</Link>  {/* Botón que lleva a /login */}
    </div>
  );
}

export default HomePage;
