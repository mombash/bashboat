import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MqttClient = ({ onDataReceived }) => {
  const [client, setClient] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [hasReceivedValidData, setHasReceivedValidData] = useState(false); // New state variable

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://broker.emqx.io:8083/mqtt', {
      clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    });

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT Broker');
      mqttClient.subscribe('test-topic', (err) => {
        if (err) {
          console.error('Failed to subscribe to topic', err);
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        setLastMessageTime(Date.now());
        setHasReceivedValidData(true); // Set to true when valid data is received

        const vesselData = data.updates.map(update => {
          const position = update.values.find(value => value.path === 'navigation.position');
          const speed = update.values.find(value => value.path === 'navigation.speedOverGround');
          if (position && position.value.latitude !== null && position.value.longitude !== null) {
            const uuid = data.context.split(':').pop();
            return {
              id: uuid,
              lat: position.value.latitude,
              lng: position.value.longitude,
              speed: speed?.value || 0,
            };
          }
          return null;
        }).filter(item => item !== null); // Filter out invalid positions

        onDataReceived(vesselData);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    setClient(mqttClient);

    const dummyDataInterval = setInterval(() => {
      if (!hasReceivedValidData && Date.now() - lastMessageTime > 5000) { // Check if no valid data has been received
        // Generate and send dummy data
        const dummyData = {
          updates: [{
            source: { sentence: "RMC", talker: "GN", type: "NMEA0183", label: "gps" },
            timestamp: new Date().toISOString(),
            values: [{
              path: "navigation.position", value: { longitude: Date.now() % 60, latitude: Date.now() % 30 }
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

        const vesselData = dummyData.updates.map(update => {
          const position = update.values.find(value => value.path === 'navigation.position');
          const speed = update.values.find(value => value.path === 'navigation.speedOverGround');
          if (position && position.value.latitude !== null && position.value.longitude !== null) {
            const uuid = dummyData.context.split(':').pop();
            return {
              id: uuid,
              lat: position.value.latitude,
              lng: position.value.longitude,
              speed: speed?.value || 0,
            };
          }
          return null;
        }).filter(item => item !== null); // Filter out invalid positions

        console.log('Injecting dummy data:', vesselData);
        onDataReceived(vesselData);
        setLastMessageTime(Date.now());
      }
    }, 5000);

    return () => {
      if (client) {
        client.end();
      }
      clearInterval(dummyDataInterval);
    };
  }, [lastMessageTime, onDataReceived, hasReceivedValidData]); // Include hasReceivedValidData in the dependency array

  return null;
};

export default MqttClient;
