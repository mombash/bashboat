import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";
import marker from "../img/myVessel-map-marker.png";
import otherMarker from "../img/otherVessel-map-marker.png";

const MapComponent = ({ vesselData , showOtherVessels , showVesselPath}) => {
  const vesselEntries = Object.entries(vesselData).map(([id, positions]) => ({
    id,
    positions: positions.flat().map(({ lat, lng }) => [lat, lng]),
    owner: positions[0][0].owner,
  }));

  const center =
    vesselEntries.length > 0 && vesselEntries[0].positions.length > 0
      ? vesselEntries[0].positions[0]
      : [0, 0];

  const options = { smoothFactor: 10 };

  return (
    <div className="map-container">
      <MapContainer
        className="map-container"
        center={center}
        zoom={9}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {vesselEntries.map((vessel) => {
          const latestPosition = vessel.positions[vessel.positions.length - 1]; // Get the latest position
          console.log("MAPCOMPONENT: Latest Position:", latestPosition);
          const customIcon = new L.Icon({
            iconUrl: vessel.owner === "myVessel" ? marker : otherMarker,
            iconSize: [25, 41], // Size of the icon
            iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
            popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
          });
          if (showOtherVessels || vessel.owner === "myVessel") {
            return (
              <Marker
                key={`${vessel.id}-latest`}
                position={latestPosition}
                icon={customIcon}
              >
                <Popup>
                  Vessel ID: {vessel.id}
                  <br />
                  Latitude: {latestPosition[0]}
                  <br />
                  Longitude: {latestPosition[1]} <br />
                  Owner: {vessel.owner}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
        {showVesselPath && vesselEntries.map((vessel, index) => (
          vessel.owner === "myVessel" && (
            <Polyline
              key={`path-${vessel.id}`}
              pathOptions={{
                ...options,
                color: `hsl(${(index * 360) / vesselEntries.length}, 100%, 50%)`,
              }}
              positions={vessel.positions}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
