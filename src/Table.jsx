// Table.jsx
import React from "react";

function Table({ latestVesselData }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Speed (knots)</th>
          <th>Location</th>
        </tr>
      </thead>
      {latestVesselData.length > 0 ? (
        <tbody>
          {latestVesselData.map((vessel) => (
            <tr key={vessel.id}>
              <td>{vessel.id}</td>
              <td>{vessel.speed}</td>
              <td>{`${vessel.lat}, ${vessel.lng}`}</td>
            </tr>
          ))}
        </tbody>
      ) : (
        <tbody>
          <tr>
            <td colSpan="3">No data yet...</td>
          </tr>
        </tbody>
      )}
    </table>
  );
}

export default Table;
