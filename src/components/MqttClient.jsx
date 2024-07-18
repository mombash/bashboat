import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import { generateDummyData } from "./generateDummyData";

const MqttClient = ({ onDataReceived, extractVesselData }) => {
  const [client, setClient] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [hasReceivedValidData, setHasReceivedValidData] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect("ws://broker.emqx.io:8083/mqtt", {
      clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
    });

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT Broker");
      // Subscribe to the original topic
      mqttClient.subscribe("test-topic", (err) => {
        if (err) {
          console.error("Failed to subscribe to topic", err);
        }
      });
      // Subscribe to the new topic
      mqttClient.subscribe("test-topic/measurments/#", (err) => {
        if (err) {
          console.error("Failed to subscribe to test-topic/measurements", err);
        }
      });
    });

    let measurements = {};
    let navigation = {};

    mqttClient.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message on ${topic}:`, data);
        if (topic === "test-topic") {
          setLastMessageTime(Date.now());
          setHasReceivedValidData(true); // Set to true when valid data is received
          navigation = data;
          console.log("MQTTCLIENT: Received navigation data:", navigation);
        }
        if (topic === "test-topic/measurments") {
          setLastMessageTime(Date.now());
          setHasReceivedValidData(true); // Set to true when valid data is received
          measurements = data;
          console.log("MQTTCLIENT: Received measurements:", measurements);
        }

        console.log("MQTTCLIENT: Navigation keys ", Object.keys(navigation));
        
        if (Object.keys(navigation).length === 0 && Object.keys(measurements).length === 0) {
          console.log("MQTTCLIENT: No data received yet");
          return;
        }
        else if (Object.keys(navigation).length !== 0 && Object.keys(measurements).length === 0) {
          console.log("MQTTCLIENT: Extracted navigation data only, vessel data:");
          const vesselData = extractVesselData({...navigation});
          console.log("MQTTCLIENT: Navigation Vessel Data format:", vesselData);
          onDataReceived(vesselData);
        }
        else if (Object.keys(navigation).length === 0 && Object.keys(measurements).length !== 0) {
          console.log("MQTTCLIENT: Extracted measurements data only, vessel data:");
          const vesselData = extractVesselData({...measurements});
          console.log("MQTTCLIENT: Measurements Vessel Data format:", vesselData);
          onDataReceived(vesselData);
        }
        else {
          console.log("MQTTCLIENT: Extracted both navigation and measurements data, vessel data:");
          console.log("MQTTCLIENT: Navigation format", navigation);
          const vesselData = Object.keys(navigation.updates).reduce((acc, vesselId) => {
            console.log("MQTTCLIENT: Vessel ID DEBUG:", vesselId);
            const vesselUUID = navigation.context.split(":").pop();
            console.log("MQTTCLIENT: Context DEBUG:", vesselUUID);
            console.log("MQTTCLIENT: Measurements format:", measurements);
            console.log("MQTTCLIENT: Measurements context:", measurements.vessel_uuid);
            if (measurements.vessel_uuid === vesselUUID) {
              console.log("MQTTCLIENT: match found for vessel:", vesselUUID);
              const combinedData = { ...navigation, ...measurements };
              const extractedData = extractVesselData(combinedData);
              acc.push(extractedData);
            } else {
              console.log("MQTTCLIENT: match not found for vessel:", vesselUUID);
              const extractedData = extractVesselData({...navigation});
              acc.push(extractedData);
            }
            return acc;
          }, []);
          console.log("MQTTCLIENT: both datas mixed and fixed?:",vesselData[0]);
          onDataReceived(vesselData[0]);
        }
        

      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    setClient(mqttClient);

    const dummyDataInterval = setInterval(() => {
      if (!hasReceivedValidData && Date.now() - lastMessageTime > 5000) {
        const dummyData = generateDummyData();
        const dummyVesselData = extractVesselData(dummyData);
        console.log("Injecting dummy data:", dummyData);
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
  }, [lastMessageTime, onDataReceived, hasReceivedValidData, extractVesselData]);

  return null;
};

export default MqttClient;