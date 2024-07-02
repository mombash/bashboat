// Table.jsx
import React from 'react';

function Table({ latestVesselData }) {
    return (
      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Speed (knots)</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {latestVesselData.map((vessel) => (
            <tr key={vessel.id}>
              <td>{vessel.id}</td>
              <td>{vessel.speed}</td>
              <td>{`${vessel.lat}, ${vessel.lng}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

export default Table;