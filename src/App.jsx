import React, { useState } from 'react';
import MqttClient from './MqttClient';
import MapComponent from './MapComponent';
import Table from './Table';
import './App.css';

function getLatestVessels(vesselData) {
  const latestVessels = {};
  vesselData.forEach(vessel => {
    // Assuming vessel.id is the unique identifier for each vessel
    latestVessels[vessel.id] = vessel;
  });
  return Object.values(latestVessels);
}

const App = () => {
  const [vesselData, setVesselData] = useState({});

  const handleDataReceived = (data) => {
    const vesselId = data[0].id; // Extract vessel ID from the context field
    console.log('Received data for vessel:', vesselId);
    setVesselData((prevData) => ({
      ...prevData,
      [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data]
    }));
  };

  // const latestVesselData = vesselData[vesselData.length - 1];


  console.log("Number of Vessels: ", Object.keys(vesselData).length);
  console.log("Vessel Data Type: ", typeof vesselData);
  console.log("Vessel Data: ", vesselData);
  if (Object.keys(vesselData).length) {
    // console.log("Latest Latitude:", latestVesselData[0].lat);
  }

  console.log("Is Vessel an Object: ", vesselData.constructor === Object);
  const keys = Object.keys(vesselData);
  const someKey = keys[0];
  console.log("Some Key: ", someKey)
  console.log("Type of Some Key: ", typeof someKey)
  
  const flattenedVesselData = Object.values(vesselData).flat(2);
  const latestVesselData = getLatestVessels(flattenedVesselData);

  return (
    <div className="app-container">
      <h1>Vessel Navigation Data</h1>
      <MqttClient onDataReceived={handleDataReceived} />
      {typeof someKey !== 'undefined' ? (
        <>
          {vesselData[someKey].length > 1 ? (
            <>
              <Table latestVesselData={latestVesselData} />
              {/* <MapComponent vesselData={vesselData} latestVesselData={latestVesselData} /> */}
            </>
          ) : (
            <p>Loading vessel data...</p>
          )}
        </>
      ) : (
        <p>No vessel data yet...</p>)
      }
    </div>
  );
};

export default App;
