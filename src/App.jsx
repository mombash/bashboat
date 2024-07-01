import React, { useState } from 'react';
import MqttClient from './MqttClient';
import MapComponent from './MapComponent';
import Table from './Table';
import './App.css';

const App = () => {
  const [vesselData, setVesselData] = useState([]);

  const handleDataReceived = (data) => {
    setVesselData((prevData) => [...prevData, data]);
  };

  const latestVesselData = vesselData[vesselData.length - 1];

  console.log(vesselData); // Log the vesselData array
  if (vesselData.length > 1) {
    console.log(latestVesselData[0].lat); // Log the latestVesselData
  }

  return (
    <div className="app-container">
      <h1>Vessel Navigation Data</h1>
      <MqttClient onDataReceived={handleDataReceived} />
      {vesselData.length > 1 ? (
        <>
          <Table vesselData={latestVesselData} />
          <MapComponent vesselData={vesselData} latestVesselData={latestVesselData} />
        </>
      ) : (
        <p>Loading vessel data...</p>
      )}
    </div>
  );
};

export default App;
