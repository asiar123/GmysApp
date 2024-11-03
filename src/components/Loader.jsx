import React from 'react';
import './Loader.css';

const Loader = ({ className }) => {
  return (
    <div className={`loader-container ${className}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
