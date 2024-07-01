// Table.jsx
import React from 'react';

function Table({ vesselData }) { // Accept vesselData as a prop

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
        {vesselData.map((vessel) => (
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