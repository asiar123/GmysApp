import React, { useState, useEffect } from 'react';
import { getVehicles } from '../services/authService';
import axios from 'axios';

const API_URL = 'https://proxy-gmys.onrender.com';

const fetchGeocercaPlaca = async (vehiculoId) => {
    try {
        const response = await axios.get(`${API_URL}/geocerca_placa?vehi_id=${vehiculoId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching geocerca data:", error);
        throw error;
    }
};

const GeocercaView = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [selectedVehiculo, setSelectedVehiculo] = useState('');
    const [geocercas, setGeocercas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingVehiculos, setLoadingVehiculos] = useState(true);

    useEffect(() => {
        const fetchVehiculos = async () => {
            const usuarioId = localStorage.getItem('usuario_id');
            if (usuarioId) {
                try {
                    const vehicles = await getVehicles(usuarioId);
                    console.log("Vehículos obtenidos:", vehicles);
                    setVehiculos(vehicles);
                } catch (error) {
                    console.error("Error loading vehicles:", error);
                } finally {
                    setLoadingVehiculos(false);
                }
            }
        };
        fetchVehiculos();
    }, []);

    useEffect(() => {
        if (selectedVehiculo) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const data = await fetchGeocercaPlaca(selectedVehiculo);
                    const geocercasConPuntos = data.map((item) => ({
                        ...item,
                        puntos: JSON.parse(item.puntos),
                    }));
                    setGeocercas(geocercasConPuntos);
                } catch (error) {
                    console.error("Error loading geocercas", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [selectedVehiculo]);

    const handleSelectChange = (event) => {
        setSelectedVehiculo(event.target.value);
        setGeocercas([]); // Limpiar geocercas cuando se selecciona otro vehículo
    };

    if (loadingVehiculos) return <p>Cargando lista de vehículos...</p>;

    return (
        <div>
            <h1>Geocercas de Vehículos</h1>

            {/* Selección de vehículo */}
            <select value={selectedVehiculo} onChange={handleSelectChange} style={{ padding: '10px', margin: '10px 0', width: '100%' }}>
                <option value="">Selecciona un vehículo</option>
                {vehiculos.map((vehiculo) => (
                    <option key={vehiculo.vehi_id} value={vehiculo.vehi_id}>
                        {vehiculo.veh_placa ? `${vehiculo.veh_placa} (ID: ${vehiculo.vehi_id})` : `ID: ${vehiculo.vehi_id}`}
                    </option>
                ))}
            </select>


            {/* Mostrar geocercas solo si hay un vehículo seleccionado */}
            {selectedVehiculo && (
                <div>
                    {loading ? (
                        <p>Cargando geocercas...</p>
                    ) : (
                        <ul>
                            {geocercas.map((geocerca, index) => (
                                <li key={index}>
                                    <h2>{geocerca.nombre}</h2>
                                    <p><strong>Vehículo ID:</strong> {geocerca.vehiculo_id}</p>
                                    <p><strong>Puntos:</strong></p>
                                    <ul>
                                        {geocerca.puntos[0].map((punto, idx) => (
                                            <li key={idx}>
                                                Lat: {punto.jb}, Lon: {punto.kb}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default GeocercaView;
