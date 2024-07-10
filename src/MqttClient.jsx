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

    mqttClient.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message on ${topic}:`, data);
        if (topic === "test-topic") {
          setLastMessageTime(Date.now());
          setHasReceivedValidData(true); // Set to true when valid data is received

          const vesselData = extractVesselData(data);
          onDataReceived(vesselData);
        }
        // No additional action needed for "test-topic/measurement" as logging is already done
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