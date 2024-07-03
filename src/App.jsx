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
  // const [vesselData, setVesselData] = useState({});
  const [vesselData, setMyVesselData] = useState({});
  const [otherVesselData, setOtherVesselData] = useState({});

  // const handleDataReceived = (data) => {
  //   const vesselId = data[0].id; // Extract vessel ID from the context field
  //   console.log('Received data for vessel:', vesselId);
  //   setVesselData((prevData) => ({
  //     ...prevData,
  //     [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data]
  //   }));
  // };

  // Utility function to extract vessel data
const extractVesselData = (data) => {
  return data.updates.map(update => {
    const position = update.values.find(value => value.path === 'navigation.position');
    const speed = update.values.find(value => value.path === 'navigation.speedOverGround');
    const isMyVessel = data.context.startsWith("vessels.urn:mrn:signalk:uuid:");

    if (position && position.value.latitude !== null && position.value.longitude !== null) {
      const uuid = data.context.split(':').pop();
      return {
        id: uuid,
        lat: position.value.latitude,
        lng: position.value.longitude,
        speed: speed?.value || 0,
        owner: isMyVessel ? 'myVessel' : 'otherVessel',
      };
    }
    return null;
  }).filter(item => item !== null); // Filter out invalid positions
}

  // const handleDataReceived = (data) => {
  //   const extractedData = extractVesselData(data);
  //   console.log('Extracted vessel data:', extractedData);
  //   extractedData.forEach(vessel => {
  //     if (vessel.owner === 'myVessel') {
  //       setMyVesselData(prevData => ({
  //         ...prevData,
  //         [vessel.id]: data
  //       }));
  //     } else {
  //       setOtherVesselData(prevData => ({
  //         ...prevData,
  //         [vessel.id]: data
  //       }));
  //     }
  //   });
  // };

  // const handleDataReceived = (data) => {
  //   // Check if the vessel is 'myVessel' or 'otherVessel' before extracting data
  //   const isMyVessel = data.context.startsWith("vessels.urn:mrn:signalk:uuid:");
  //   const owner = isMyVessel ? 'myVessel' : 'otherVessel';
  
  //   // Now extract the data
  //   const extractedData = extractVesselData(data);
  
  //   console.log('Extracted vessel data:', extractedData);
  
  //   // Use the owner variable determined before extraction to decide how to set the data
  //   extractedData.forEach(vessel => {
  //     if (owner === 'myVessel') {
  //       setMyVesselData(prevData => ({
  //         ...prevData,
  //         [vessel.id]: vessel // Use extracted vessel data instead of raw data
  //       }));
  //     } else {
  //       setOtherVesselData(prevData => ({
  //         ...prevData,
  //         [vessel.id]: vessel // Use extracted vessel data instead of raw data
  //       }));
  //     }
  //   });
  // };

  const handleDataReceived = (data) => {
    // Determine if the data is from 'myVessel' or 'otherVessel' based on the context
    const isMyVessel = data.context.startsWith("vessels.urn:mrn:signalk:uuid:");
    const owner = isMyVessel ? 'myVessel' : 'otherVessel';
  
    // Log the received data
    console.log('Received vessel data:', data);
  
    // Use the owner variable to decide how to set the data without extracting it
    if (owner === 'myVessel') {
      setMyVesselData(prevData => ({
        ...prevData,
        [data.context]: data // Use unextracted data directly
      }));
    } else {
      setOtherVesselData(prevData => ({
        ...prevData,
        [data.context]: data // Use unextracted data directly
      }));
    }
  };

  // const latestVesselData = vesselData[vesselData.length - 1];


  console.log("Number of Vessels: ", Object.keys(vesselData).length);
  console.log("Vessel Data Type: ", typeof vesselData);
  console.log("Vessel Data: ", vesselData);
  if (Object.keys(vesselData).length) {
    // console.log("Latest Latitude:", latestVesselData[0].lat);
  }
  console.log("Is Vessel an Object: ", vesselData.constructor === Object);
  const myKeys = Object.keys(vesselData);
  console.log("My Keys: ", myKeys)
  const mySomeKey = myKeys[0];
  console.log("Some Key: ", mySomeKey)
  console.log("Type of Some Key: ", typeof mySomeKey)
  
  const keys = Object.keys(otherVesselData);
  const someKey = keys[0];
  console.log("Some Key: ", someKey)
  console.log("Type of Some Key: ", typeof someKey)

  const myFlattenedVesselData = Object.values(vesselData).flat(2);
  const myLatestVesselData = getLatestVessels(myFlattenedVesselData);
  
  const otherFlattenedVesselData = Object.values(otherVesselData).flat(2);
  const otherLatestVesselData = getLatestVessels(otherFlattenedVesselData);

  return (
    <div className="app-container">
      <h1>BASHBOAT</h1>
      <h2>naval fleet management</h2>
      <MqttClient extractVesselData={extractVesselData} onDataReceived={handleDataReceived} />
      {typeof mySomeKey !== 'undefined' || typeof someKey != 'undefined' ? (
        <>
          {(vesselData[mySomeKey]?.length > 1 || otherVesselData[someKey]?.length > 1) ? (
            <>
              {/* <Table latestVesselData={latestVesselData} /> */}
              <h3>My Vessels</h3>
              <Table extractVesselData={extractVesselData} vesselData={Object.values(myLatestVesselData)} />
              <h3>Other Vessels</h3>
              <Table extractVesselData={extractVesselData} vesselData={Object.values(otherLatestVesselData)} />
              {/* <MapComponent vesselData={vesselData} /> */}
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
