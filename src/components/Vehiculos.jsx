import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/vehiculos_user', {
          params: {
            usuario_id: 1,  // Aquí deberías pasar el ID de usuario real
          },
        });
        setVehiculos(response.data);
      } catch (error) {
        console.error('Error al obtener vehículos', error);
      }
    };

    fetchVehiculos();
  }, []);

  return (
    <div>
      <h1>Listado de Vehículos</h1>
      <ul>
        {vehiculos.map((vehiculo) => (
          <li key={vehiculo.vehi_id}>
            Placa: {vehiculo.vehi_placa}, Velocidad: {vehiculo.velocidad}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Vehiculos;
