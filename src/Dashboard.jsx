// src/Dashboard.jsx
import React from "react";
import TileComponent from "./TileComponent";
import "./Dashboard.css";

function Dashboard({ vesselMeasurements }) {
  return (
    <div className="dashboard">
      <h2>Vessel Measurements Dashboard</h2>
      <table className="dashboard-table">
        <tbody>
          {Object.entries(vesselMeasurements).map(([id, measurements]) => (
            <>
              <tr key={id}>
                <td colSpan={3}>Measurements for Vessel:</td>
              </tr>
              <tr>
                <td className="dashboard-table-id" colSpan={3}>{id}</td>
              </tr>
              <tr>
                <td>
                  <div>
                    <TileComponent
                      label="Temperature"
                      measurement={measurements.temperature}
                    />
                  </div>
                </td>
                <td>
                  <TileComponent
                    label="Humidity"
                    measurement={measurements.humidity}
                  />
                </td>
                <td>
                  <TileComponent
                    label="Pressure"
                    measurement={measurements.pressure}
                  />
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
