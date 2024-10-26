import React, { useState } from 'react';
import Vehiculos from './Vehiculos';
import ConsumoVehiculo from './ConsumoVehiculo';

const VehiculosDashboard = () => {
  const [selectedVehiId, setSelectedVehiId] = useState(null);

  const handleConsultarConsumo = (vehiId) => {
    setSelectedVehiId(vehiId);
  };

  return (
    <div className="dashboard">
      {selectedVehiId ? (
        <ConsumoVehiculo vehiId={selectedVehiId} />
      ) : (
        <Vehiculos onConsultarConsumo={handleConsultarConsumo} />
      )}
    </div>
  );
};

export default VehiculosDashboard;
