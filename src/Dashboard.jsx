// src/Dashboard.jsx
import React from "react";
import TileComponent from "./TileComponent";
import "./Dashboard.css";

function Dashboard({ vesselMeasurements }) {
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Vessel Measurements Dashboard</h2>
      <table className="dashboard-table">
        <tbody>
          {Object.entries(vesselMeasurements).map(([id, measurements]) => (
            <>
              <tr key={id}>
                <td colSpan={3}>Measurements for Vessel:</td>
              </tr>
              <tr>
                <td className="dashboard-table-id" colSpan={3}>
                  {id}
                </td>
              </tr>
              <tr>
                <td>
                  <div className="dashboard-tile-container">
                    <TileComponent
                      label="Temperature"
                      measurement={measurements.temperature}
                    />
                  </div>
                </td>
                <td>
                <div className="dashboard-tile-container">
                  <TileComponent
                    label="Humidity"
                    measurement={measurements.humidity}
                  />
                </div>
                </td>
                <td>
                    <div className="dashboard-tile-container">
                        <TileComponent
                            label="Pressure"
                            measurement={measurements.pressure}
                        />
                    </div>
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
