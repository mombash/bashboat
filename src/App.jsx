import React, { useState } from "react";
import MqttClient from "./components/MqttClient";
import MapComponent from "./components/MapComponent";
import EmptyMapComponent from "./components/EmptyMapComponent";
import Table from "./components/Table";
import "./App.css";
import Dashboard from "./components/Dashboard";

function getLatestVessels(vesselData) {
  const latestVessels = {};
  vesselData.forEach((vessel) => {
    latestVessels[vessel.id] = vessel;
  });
  return Object.values(latestVessels);
}

const App = () => {
  const [vesselData, setMyVesselData] = useState({});
  const [otherVesselData, setOtherVesselData] = useState({});
  const [isAllDataValid, setIsAllDataValid] = useState(false);
  const [showOtherVessels, toggleShowOtherVessels] = useState(false);
  const [showVesselPath, toggleShowVesselPath] = useState(false);
  const [showDashboard, toggleShowDashboard] = useState(false);

  // Utility function to extract relevant vessel data from data recieved.
  // It also simplifies the format of the data.
  const extractVesselData = (data) => {
    console.log("EXTRACTVESSELDATA: Extracting vessel data:", data);
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

        const isNavDataValid =
          position &&
          position.value.latitude !== null &&
          position.value.longitude !== null;
        const isMeasureDataValid =
          data.temperature !== null &&
          data.humidity !== null &&
          data.pressure !== null;

        const uuid = data.context.split(":").pop();

        if (isNavDataValid && !isMeasureDataValid) {
          console.log("EXTRACTVESSELDATA: Extracted navigation data only");
          return {
            id: uuid,
            lat: position.value.latitude,
            lng: position.value.longitude,
            speed: speed?.value || 0,
            owner: isMyVessel ? "myVessel" : "otherVessel",
          };
        } else if (!isNavDataValid && isMeasureDataValid) {
          console.log("EXTRACTVESSELDATA: Extracted measurements data only");
          return {
            id: uuid,
            temperature: data.temperature,
            humidity: data.humidity,
            pressure: data.pressure,
            owner: isMyVessel ? "myVessel" : "otherVessel",
          };
        } else {
          console.log(
            "EXTRACTVESSELDATA: Extracted both measurement and naviagtion data"
          );
          return {
            id: uuid,
            lat: position.value.latitude,
            lng: position.value.longitude,
            speed: speed?.value || 0,
            temperature: data.temperature,
            humidity: data.humidity,
            pressure: data.pressure,
            owner: isMyVessel ? "myVessel" : "otherVessel",
          };
        }

        return null;
      })
      .filter((item) => item !== null); // Filter out invalid positions
  };

  // Utility function to update the relevant state based on the owner of the data.
  const handleDataReceived = (data) => {
    console.log("HANDLEDATARECIEVED: Received vessel data:", data);

    const vesselId = data[0].id;
    console.log("HANDLEDATARECIEVED: Received data for vessel:", vesselId);

    if (data[0].owner === "myVessel") {
      setMyVesselData((prevData) => ({
        ...prevData,
        [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data],
      }));
    } else {
      setOtherVesselData((prevData) => ({
        ...prevData,
        [vesselId]: prevData[vesselId] ? [...prevData[vesselId], data] : [data],
      }));
    }
  };

  // Testing if there is valid data in my vessel data
  const myKeys = Object.keys(vesselData);
  const mySomeKey = myKeys[0];
  if (typeof vesselData[mySomeKey] !== "undefined") {
    console.log("APP: Your contains a valid entry");
  }
  // Testing if there's valid data in other vessel data
  const keys = Object.keys(otherVesselData);
  const someKey = keys[0];
  if (typeof otherVesselData[someKey] !== "undefined") {
    console.log("APP: Other vessel contains a valid entry");
  }

  // Testing if all data contains valid entries, this is the criteria for displaying the map
  if (typeof mySomeKey !== "undefined" && typeof someKey !== "undefined") {
    if (
      vesselData[mySomeKey].length >= 1 &&
      otherVesselData[someKey].length >= 1
    ) {
      console.log("APP: All data contains valid entries");
      if (!isAllDataValid) {
        setIsAllDataValid(true);
      }
    }
  }

  // Getting the latest versions of all data
  const myFlattenedVesselData = Object.values(vesselData).flat(2);
  const myLatestVesselData = getLatestVessels(myFlattenedVesselData);

  const otherFlattenedVesselData = Object.values(otherVesselData).flat(2);
  const otherLatestVesselData = getLatestVessels(otherFlattenedVesselData);

  const myLatestMeasurements = myLatestVesselData.reduce((acc, vessel) => {
    if (
      vessel.temperature !== undefined &&
      vessel.humidity !== undefined &&
      vessel.pressure !== undefined
    ) {
      return {
        ...acc,
        [vessel.id]: {
          temperature: vessel.temperature,
          humidity: vessel.humidity,
          pressure: vessel.pressure,
        },
      };
    }
    return acc;
  }, {});

  // Function to update the footer.
  function updateFooter() {
    const footer = document.querySelector(".footer");
    const footerContent = footer.innerHTML.trim();

    if (footerContent === "") {
      footer.style.minHeight = "0";
      footer.style.padding = "0";
    } else {
      footer.style.minHeight = "3vh";
    }
  }

  document.addEventListener("DOMContentLoaded", updateFooter);

  return (
    <>
      <button
        className={`choose-dashboard-button ${
          showDashboard ? "dashboard-enabled" : "dashboard-disabled"
        }`}
        onClick={() => toggleShowDashboard(!showDashboard)}
        title={
          showDashboard
            ? "Showing Dashboard View.\nClick to return to App View."
            : "Showing App View.\nClick to show Dashboard View."
        }
      >
        {showDashboard ? "Back to App" : "Go to Dashboard"}
      </button>
      {!showDashboard ? (
        <div className="app-container">
          <div className="title-div">
            <h1>BASHBOAT</h1>
            <h2>naval fleet management</h2>
            <div className="status-indicators">
              <div className="status-indicator">
                <span className="status-square red"></span>
                <span>Your Vessels</span>
              </div>
              <div className="status-indicator">
                <span className="status-square blue"></span>
                <span>Other Vessels</span>
              </div>
            </div>
          </div>
          <>
            <div className="map-div">
              {/* all vessels map */}
              <button
                className={`show-path-button ${
                  showVesselPath ? "path-enabled" : "path-disabled"
                }`}
                onClick={() => toggleShowVesselPath(!showVesselPath)}
                title={
                  showOtherVessels
                    ? "Showing your vessel paths.\nClick to hide."
                    : "Hiding your vessel paths.\nClick to show."
                }
              ></button>
              <button
                className={`show-vessel-button ${
                  showOtherVessels ? "vessel-enabled" : "vessel-disabled"
                }`}
                onClick={() => toggleShowOtherVessels(!showOtherVessels)}
                title={
                  showOtherVessels
                    ? "Showing other vessels.\nClick to hide."
                    : "Showing only your vessels.\nClick to show other vessels."
                }
              ></button>
              {isAllDataValid ? (
                <MapComponent
                  showVesselPath={showVesselPath}
                  showOtherVessels={showOtherVessels}
                  vesselData={{ ...vesselData, ...otherVesselData }}
                />
              ) : (
                <EmptyMapComponent />
              )}
            </div>
          </>
          <MqttClient
            extractVesselData={extractVesselData}
            onDataReceived={handleDataReceived}
          />
          <div className="table-div">
            {showOtherVessels ? (
              <Table
                className="table-div"
                latestVesselData={Object.values(
                  myLatestVesselData.concat(otherLatestVesselData)
                )}
              />
            ) : (
              <Table
                className="table-div"
                latestVesselData={Object.values(myLatestVesselData)}
              />
            )}
          </div>
          <div className="footer">
            {typeof someKey !== "undefined" ? (
              otherVesselData[someKey].length < 1 ? (
                <p>Loading other vessel data...</p>
              ) : (
                <></>
              )
            ) : (
              <p>No other vessel data yet...</p>
            )}
            {typeof mySomeKey !== "undefined" ? (
              vesselData[mySomeKey].length < 1 ? (
                <p>Loading my vessel data...</p>
              ) : (
                <></>
              )
            ) : (
              <p>No my vessel data yet...</p>
            )}
          </div>
        </div>
      ) : (
        <Dashboard vesselMeasurements={myLatestMeasurements} />
      )}
    </>
  );
};

export default App;
