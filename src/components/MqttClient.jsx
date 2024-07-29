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
      console.log("MQTTCLIENT: Connected to MQTT Broker");
      // Subscribe to the original topic
      mqttClient.subscribe("test-topic", (err) => {
        if (err) {
          console.error(
            "MQTTCLIENT: Failed to subscribe to navigation topic",
            err
          );
        }
      });
      // Subscribe to the new topic
      mqttClient.subscribe("test-topic/measurments/#", (err) => {
        if (err) {
          console.error(
            "MQTTCLIENT: Failed to subscribe to measurements topic",
            err
          );
        }
      });
    });

    let measurements = {};
    let navigation = {};

    mqttClient.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`MQTTCLIENT: Received below message on ${topic}:`, data);
        if (topic === "test-topic") {
          setLastMessageTime(Date.now());
          setHasReceivedValidData(true); // Set to true when valid data is received
          navigation = data;
          console.log("MQTTCLIENT: Received new navigation data:", navigation);
        }
        if (topic === "test-topic/measurments") {
          setLastMessageTime(Date.now());
          setHasReceivedValidData(true); // Set to true when valid data is received
          measurements = data;
          console.log("MQTTCLIENT: Received new measurements:", measurements);
        }

        if (
          Object.keys(navigation).length === 0 &&
          Object.keys(measurements).length === 0
        ) {
          console.log("MQTTCLIENT: No vessel data has been received yet");
          return;
        } else if (
          Object.keys(navigation).length !== 0 &&
          Object.keys(measurements).length === 0
        ) {
          console.log("MQTTCLIENT: Current data contains only navigation data");
          const vesselData = extractVesselData({ ...navigation });
          onDataReceived(vesselData);
        } else if (
          Object.keys(navigation).length === 0 &&
          Object.keys(measurements).length !== 0
        ) {
          console.log(
            "MQTTCLIENT: Current data contains only measurements data"
          );
          const vesselData = extractVesselData({ ...measurements });
          onDataReceived(vesselData);
        } else {
          console.log(
            "MQTTCLIENT: Current data contains both navigation and measurements data"
          );

          const vesselData = Object.keys(navigation.updates).reduce(
            (acc, vesselId) => {
              const vesselUUID = navigation.context.split(":").pop();
              if (measurements.vessel_uuid === vesselUUID) {
                console.log(
                  "MQTTCLIENT: Measurment data recieved has been mached with vessel:",
                  vesselUUID
                );
                const combinedData = { ...navigation, ...measurements };
                const extractedData = extractVesselData(combinedData);
                acc.push(extractedData);
              } else {
                console.log(
                  "MQTTCLIENT: No navigation data found for measurments recieved from vessel:",
                  vesselUUID
                );
                const extractedData = extractVesselData({ ...navigation });
                acc.push(extractedData);
              }
              return acc;
            },
            []
          );
          onDataReceived(vesselData[0]);
        }
      } catch (error) {
        console.error("MQTTCLIENT: Error parsing message:", error);
      }
    });

    setClient(mqttClient);

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [onDataReceived, extractVesselData]);

  return null;
};

export default MqttClient;
