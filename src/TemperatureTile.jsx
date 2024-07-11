import React from "react";
import "./TemperatureTile.css";

const TemperatureTile = ({ temperature }) => {
  return (
    <div className="temperature-tile">
      <div>Temperature</div>
      <div className="temperature-value">{temperature}</div>
    </div>
  );
};

export default TemperatureTile;