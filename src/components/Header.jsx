import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBars, faTimes, faHome, faChartLine, faMapMarkedAlt, faCar, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Loader from './Loader'; // Asegúrate de importar el componente de animación
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsLoading(true);
    setIsVisible(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setIsLoading(false);
      setTimeout(() => setIsVisible(false), 500);
      navigate('/login');
    }, 2000);
  };

  return (
    <header className="header">
      {isVisible && <Loader className={!isLoading ? 'fade-out' : ''} />}

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
          <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/dashboard" className="menu-item" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faHome} /> Inicio
            </Link>
            <Link to="/reportes" className="menu-item" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faChartLine} /> Reportes
            </Link>
            <Link to="/geocercas" className="menu-item" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faMapMarkedAlt} /> Ver Geocercas
            </Link>
            <Link to="/vehiculos" className="menu-item" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faCar} /> Mis Vehículos
            </Link>
            <Link to="#" className="menu-item" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faCog} /> Configuración
            </Link>
            <Link to="#" onClick={handleLogout} className="menu-item">
              <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
            </Link>
          </div>

          {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        </>
      )}
    </header>
  );
};

export default Header;
