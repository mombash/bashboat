import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { generateDummyData } from './generateDummyData';

const MqttClient = ({ onDataReceived , extractVesselData }) => {
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
        
        // const vesselData = extractVesselData(data)
        // console.log('Extracted vessel data:', vesselData);
        onDataReceived(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    setClient(mqttClient);

    const dummyDataInterval = setInterval(() => {
      if (!hasReceivedValidData && Date.now() - lastMessageTime > 5000) { // Check if no valid data has been received
        
        const dummyData = generateDummyData();
        const dummyVesselData = extractVesselData(dummyData);
        console.log('Injecting dummy data:', dummyData);
        onDataReceived(dummyData);
        setLastMessageTime(Date.now());
      }
    }, 5000);


    return () => {
      if (client) {
        client.end();
      }
      clearInterval(dummyDataInterval);
    };
  }, [lastMessageTime, onDataReceived, hasReceivedValidData]);
  return null;
};

export default MqttClient;
