import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'; // Ícono de GPS

const Header = () => {
  return (
    <header style={styles.header}>
      <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.icon} /> {/* Ícono de GPS */}
      <h1>M&S Organizaciones SAS</h1>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#3b5998', // Cambia este color al azul claro deseado
    padding: '1rem',
    textAlign: 'center',
    color: '#fff',
    fontSize: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: '10px', // Espacio entre el ícono y el texto
    fontSize: '2rem', // Tamaño del ícono
    color: '#fff',
  },
};

export default Header;
