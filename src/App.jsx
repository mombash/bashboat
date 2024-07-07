import React, { useState } from "react";
import MqttClient from "./MqttClient";
import MapComponent from "./MapComponent";
import EmptyMapComponent from "./EmptyMapComponent";
import Table from "./Table";
import "./App.css";

// unique to formatting

function getLatestVessels(vesselData) {
  const latestVessels = {};
  vesselData.forEach((vessel) => {
    // Assuming vessel.id is the unique identifier for each vessel
    latestVessels[vessel.id] = vessel;
  });
  return Object.values(latestVessels);
}

const App = () => {
  // const [vesselData, setVesselData] = useState({});
  const [vesselData, setMyVesselData] = useState({});
  const [otherVesselData, setOtherVesselData] = useState({});
  const [isAllDataValid, setIsAllDataValid] = useState(false);

  // Utility function to extract vessel data
  const extractVesselData = (data) => {
    return data.updates
      .map((update) => {
        const position = update.values.find(
          (value) => value.path === "navigation.position"
        );
        const speed = update.values.find(
          (value) => value.path === "navigation.speedOverGround"
        );
        const isMyVessel = data.context.startsWith(
          "vessels.urn:mrn:signalk:uuid:"
        );

        if (
          position &&
          position.value.latitude !== null &&
          position.value.longitude !== null
        ) {
          const uuid = data.context.split(":").pop();
          return {
            id: uuid,
            lat: position.value.latitude,
            lng: position.value.longitude,
            speed: speed?.value || 0,
            owner: isMyVessel ? "myVessel" : "otherVessel",
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Filter out invalid positions
  };

  const handleDataReceived = (data) => {
    // Determine if the data is from 'myVessel' or 'otherVessel' based on the context
    // const isMyVessel = data.context.startsWith("vessels.urn:mrn:signalk:uuid:");
    // const owner = isMyVessel ? 'myVessel' : 'otherVessel';

    // // Log the received data
    console.log("Received vessel data:", data);

    const vesselId = data[0].id; // Extract vessel ID
    console.log("Received data for vessel:", vesselId);

    console.log("Data owner:", data[0].owner);

    // Use the owner variable to decide how to set the data without extracting it
    if (data[0].owner === "myVessel") {
      setMyVesselData((prevData) => ({
        ...prevData,
        [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data],
      }));
      //   [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data] // Use unextracted data directly
      // }));
    } else {
      setOtherVesselData((prevData) => ({
        ...prevData,
        [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data],
      }));
    }
  };
  // const latestVesselData = vesselData[vesselData.length - 1];

  console.log("Number of Vessels: ", Object.keys(vesselData).length);
  console.log("Vessel Data Type: ", typeof vesselData);
  console.log("Vessel Data: ", vesselData);
  console.log("Other vessel data: ", otherVesselData);
  if (Object.keys(vesselData).length) {
    // console.log("Latest Latitude:", latestVesselData[0].lat);
  }
  console.log("Is Vessel an Object: ", vesselData.constructor === Object);
  const myKeys = Object.keys(vesselData);
  console.log("My Keys: ", myKeys);
  const mySomeKey = myKeys[0];
  console.log("Some Key: ", mySomeKey);
  console.log("Type of mySome Key: ", typeof mySomeKey);
  console.log("My somekey of the vessel data", vesselData[mySomeKey]);
  if (typeof vesselData[mySomeKey] !== "undefined") {
    console.log(
      "Length of vesselData[mySomeKey]:",
      vesselData[mySomeKey].length
    );
  }
  const keys = Object.keys(otherVesselData);
  console.log("Keys: ", keys);
  const someKey = keys[0];
  console.log("Some Key: ", someKey);
  console.log("Type of Some Key: ", typeof someKey);
  console.log("Somekey of the vessel data", otherVesselData[someKey]);
  if (typeof otherVesselData[someKey] !== "undefined") {
    console.log(
      "Length of otherVesselData[someKey]:",
      otherVesselData[someKey].length
    );
  }

  const myFlattenedVesselData = Object.values(vesselData).flat(2);
  const myLatestVesselData = getLatestVessels(myFlattenedVesselData);

  const otherFlattenedVesselData = Object.values(otherVesselData).flat(2);
  const otherLatestVesselData = getLatestVessels(otherFlattenedVesselData);

  if (typeof mySomeKey !== "undefined" && typeof someKey !== "undefined") {
    console.log("some data is valid");
    if (
      vesselData[mySomeKey].length >= 1 &&
      otherVesselData[someKey].length >= 1
    ) {
      console.log("All data is valid");
      if (!isAllDataValid) {
        setIsAllDataValid(true);
      }
    }
  }

  return (
    <div className="app-container">
      <div className="title-div">
        <h1>BASHBOAT</h1>
        <h2>naval fleet management</h2>
      </div>
      <div className="map-div">
        {/* all vessels map */}
        {isAllDataValid ? (
          <>
            {/* <h1>All Vessels</h1> */}
            {/* <Table extractVesselData={extractVesselData} latestVesselData={Object.values(myLatestVesselData.concat(otherLatestVesselData))} /> */}
            <MapComponent vesselData={{ ...vesselData, ...otherVesselData }} />
          </>
        ) : (
          <p>Loading vessel data...</p>
        )}
      </div>
      <MqttClient
        extractVesselData={extractVesselData}
        onDataReceived={handleDataReceived}
      />

      {typeof mySomeKey !== "undefined" ? (
        <>
          {vesselData[mySomeKey].length >= 1 ? (
            <>
              {/* <h3>My Vessels</h3> */}
              <Table
                className="table-div"
                extractVesselData={extractVesselData}
                latestVesselData={Object.values(myLatestVesselData)}
              />
              {!isAllDataValid ? (
                <div className="map-div">
                  {/* <MapComponent vesselData={vesselData} /> */}
                </div>
              ) : (
                <>
                {/* <EmptyMapComponent /> */}
                </>
              )}
            </>
          ) : (
            <>
            <EmptyMapComponent />
            <p>Loading my vessel data...</p>
            </>
          )}
        </>
      ) : (
        <div className="map-div">
        <EmptyMapComponent />
        <p>No my vessel data yet...</p>
        </div>
      )}
      {typeof someKey !== "undefined" ? (
        <>
          {otherVesselData[someKey].length >= 1 ? (
            <>
              {/* <h3>Other Vessels</h3> */}
              {/* <Table
                className="table-div"
                extractVesselData={extractVesselData}
                latestVesselData={Object.values(otherLatestVesselData)}
              /> */}
              {!isAllDataValid ? (
                <div>
                  {/* <MapComponent vesselData={otherVesselData} /> */}
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <div className="map-div">
            <EmptyMapComponent />
            <p>Loading other vessel data...</p>
            </div>
          )}
        </>
      ) : (
        <div className="map-div">
        <EmptyMapComponent />
        <p>No other vessel data yet...</p>
        </div>
      )}
    </div>
  );
};

export default App;
