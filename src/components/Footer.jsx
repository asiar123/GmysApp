import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>GMYS © 2024. Todos los derechos reservados.</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#3b5998', // Cambia este color al azul claro deseado
    padding: '1rem',
    textAlign: 'center',
    color: '#fff',
    position: 'fixed',
    bottom: 0,
    width: '100%',
  },
};

export default Footer;
