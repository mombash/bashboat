import React from "react";
import "./TileComponent.css";

const TileComponent = ({ label, measurement }) => {
    return (
        <table className="tile">
            <tbody>
                <tr>
                    <td className="tile-label">{label}</td>
                </tr>
                <tr>
                    <td className="tile-value">{measurement.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default TileComponent;