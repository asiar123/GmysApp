import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'; // Íconos de GPS, hamburguesa y cierre
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Elimina el token o cualquier información de sesión almacenada
    localStorage.removeItem('token'); // Ejemplo si usas localStorage
    sessionStorage.removeItem('token'); // Ejemplo si usas sessionStorage

    // Redirecciona al usuario a la página de inicio de sesión
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.icon} />
        <h1 style={styles.title}>M&S Organizaciones SAS</h1>
        <FontAwesomeIcon 
          icon={isMenuOpen ? faTimes : faBars} 
          style={styles.menuIcon} 
          onClick={toggleMenu} 
        />
      </div>
      
      {/* Menú desplegable como side drawer */}
      <div style={{ 
        ...styles.sideMenu, 
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)' 
      }}>
        <a href="#" style={styles.menuItem}>Inicio</a>
        <Link to="/reportes" style={styles.menuItem}>Reportes</Link>
        <a href="#" style={styles.menuItem}>Configuración</a>
        <a href="#" onClick={handleLogout} style={styles.menuItem}>Cerrar sesión</a>
      </div>

      {/* Overlay para cuando el menú esté abierto */}
      {isMenuOpen && <div style={styles.overlay} onClick={toggleMenu}></div>}
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#3b5998',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
    fontSize: '1.5rem',
    position: 'relative',
    zIndex: 2,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
  },
  icon: {
    marginRight: '10px',
    fontSize: '2rem',
    color: '#fff',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  menuIcon: {
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#fff',
  },
  sideMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '250px',
    backgroundColor: '#3b5998',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '2rem',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 3,
  },
  menuItem: {
    color: '#fff',
    padding: '1rem 0',
    textDecoration: 'none',
    fontSize: '1.2rem',
    width: '100%',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
};

export default Header;
