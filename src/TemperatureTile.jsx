import React from "react";

const TemperatureTile = ({ temperature }) => {
    return (
        <table className="temperature-tile">
            <tbody>
                <tr>
                    <td>Temperature</td>
                </tr>
                <tr>
                    <td className="temperature-value">{temperature}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default TemperatureTile;