import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const MapComponent = ({ vesselData }) => {
  return (
    <div className="map-container">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "80vh", width: "90vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {vesselData.map((vessel, index) => (
          vessel.lat !== undefined && vessel.lng !== undefined && (
            <Marker key={index} position={[vessel.lat, vessel.lng]}>
              <Popup>
                Latitude: {vessel.lat}<br/>
                Longitude: {vessel.lng}<br/>
                Speed: {vessel.speed} knots
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
