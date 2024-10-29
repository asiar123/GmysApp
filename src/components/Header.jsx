import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Loader from './Loader'; // Asegúrate de importar el componente de animación
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la animación de carga
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsLoading(true); // Mostrar animación de carga
    setTimeout(() => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setIsLoading(false); // Ocultar animación de carga
      navigate('/login');
    }, 2000); // Ajusta el tiempo para que coincida con la duración de la animación
  };

  return (
    <header className="header">
      {/* Mostrar animación de carga si está cargando */}
      {isLoading && <Loader />} 

      <div className="header-content">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
        <h1 className="title">M&S Organizaciones SAS</h1>
        <FontAwesomeIcon 
          icon={isMenuOpen ? faTimes : faBars} 
          className="menu-icon" 
          onClick={toggleMenu} 
        />
      </div>
      
      {!isLoading && (
        <>
          {/* Menú desplegable como side drawer */}
          <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/dashboard" className="menu-item">Inicio</Link>
            <Link to="/reportes" className="menu-item">Reportes</Link>
            <Link to="/geocercas" className="menu-item">Ver Geocercas</Link>
            <Link to="/vehiculos" className="menu-item">Mis Vehículos</Link>
            <Link to="#" className="menu-item">Configuración</Link>
            <Link to="#" onClick={handleLogout} className="menu-item">Cerrar sesión</Link>
          </div>

          {/* Overlay para cuando el menú esté abierto */}
          {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        </>
      )}
    </header>
  );
};

export default Header;
