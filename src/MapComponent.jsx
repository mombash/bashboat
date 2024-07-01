import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const MapComponent = ({ vesselData, latestVesselData }) => {
  const positions = vesselData.flatMap(vessels => vessels.map(vessel => [vessel.lat, vessel.lng]));
  console.log("Positions:", positions);

  const options = { color: 'red', smoothFactor: 10 };

  return (
    <div className="map-container">
      <MapContainer
        center={positions[0]}
        zoom={9}
        style={{ height: "80vh", width: "90vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {latestVesselData.map((vessel) => (
          <Marker position={[vessel.lat, vessel.lng]}>
            <Popup>
              Latitude: {vessel.lat}<br/>
              Longitude: {vessel.lng}<br/>
              Speed: {vessel.speed} knots
            </Popup>
          </Marker>
        ))}
        <Polyline pathOptions={options} positions={positions} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;