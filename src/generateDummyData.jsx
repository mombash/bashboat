// bashboat-app/src/components/DummyDataGenerator.jsx
import React from 'react';

const generateLongitude = () => {
    const minLongitude = 51;
    const maxLongitude = 52;
    const longitudeRange = maxLongitude - minLongitude;
    const randomLongitude = Math.random() * longitudeRange + minLongitude;
    return randomLongitude.toFixed(6);
};

const generateLatitude = () => {
    const minLatitude = 25;
    const maxLatitude = 26;
    const latitudeRange = maxLatitude - minLatitude;
    const randomLatitude = Math.random() * latitudeRange + minLatitude;
    return randomLatitude.toFixed(6);
};

export const generateDummyData = () => {
    const dummyData = {
        updates: [{
            source: { sentence: "RMC", talker: "GN", type: "NMEA0183", label: "gps" },
            timestamp: new Date().toISOString(),
            values: [{
                path: "navigation.position", value: { longitude: generateLongitude(), latitude: generateLatitude() }
            }, {
                path: "navigation.courseOverGroundTrue", value: 0
            }, {
                path: "navigation.speedOverGround", value: 5.0
            }, {
                path: "navigation.magneticVariation", value: 0
            }, {
                path: "navigation.magneticVariationAgeOfService", value: Date.now()
            }, {
                path: "navigation.datetime", value: new Date().toISOString()
            }],
            $source: "gps.GN"
        }],
        context: "vessels.urn:mrn:signalk:uuid:dummy"
    };
    return dummyData;
};