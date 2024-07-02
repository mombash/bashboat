import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const MapComponent = ({ vesselData }) => {
  const vesselEntries = Object.entries(vesselData).map(([id, positions]) => ({
    id,
    positions: positions.flat().map(({ lat, lng }) => [lat, lng]),
  }));

  const center = vesselEntries.length > 0 && vesselEntries[0].positions.length > 0 ? vesselEntries[0].positions[0] : [0, 0];

  const options = { color: 'red', smoothFactor: 10 };

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={9}
        style={{ height: "80vh", width: "90vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {vesselEntries.map((vessel) => {
          const latestPosition = vessel.positions[vessel.positions.length - 1]; // Get the latest position
          return (
            <Marker key={`${vessel.id}-latest`} position={latestPosition}>
              <Popup>
                Vessel ID: {vessel.id}<br/>
                Latitude: {latestPosition[0]}<br/>
                Longitude: {latestPosition[1]}
              </Popup>
            </Marker>
          );
        })}
        {vesselEntries.map((vessel, index) => (
          <Polyline key={`path-${vessel.id}`} pathOptions={{ ...options, color: `hsl(${index * 360 / vesselEntries.length}, 100%, 50%)` }} positions={vessel.positions} />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;