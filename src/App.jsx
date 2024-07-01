import React, { useState } from 'react';
import MqttClient from './MqttClient';
import MapComponent from './MapComponent';
import Table from './Table';
import './App.css';

const App = () => {
  const [vesselData, setVesselData] = useState([]);

  const handleDataReceived = (data) => {
    setVesselData(data);
  };

  return (
    <div className="app-container">
      <h1>Vessel Navigation Data</h1>
      <MqttClient onDataReceived={handleDataReceived} />
      <Table vesselData={vesselData} />
      <MapComponent vesselData={vesselData} />
    </div>
  );
};

export default App;
