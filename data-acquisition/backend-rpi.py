import asyncio
import websockets
import json
import random
import sys
import re
from sense_hat import SenseHat
from datetime import datetime
import paho.mqtt.client as mqtt_client

# Signal K rpi WebSocket URL
# WEBSOCKET_URL = "ws://192.168.179.34:3000/signalk/v1/stream"

# Signal K local WebSocket URL
# WEBSOCKET_URL = "ws://localhost:3000/signalk/v1/stream"

# Signal K Home WIFI WebSocket URL
# WEBSOCKET_URL = "ws://192.168.1.16:3000/signalk/v1/stream"

# Websocket URL for Signal K server running locally
WEBSOCKET_URL = "ws://localhost:3000/signalk/v1/stream"

# MQTT broker configuration
# broker = 'broker.emqx.io' # Public broker
# Use local MQTT broker 
#broker = "localhost"

broker = 'bd2eee5e.ala.asia-southeast1.emqxsl.com' # Private broker
# port = 1883 # non-secure port (public broker only supports this)
port = 8883 # secure port (use only with private broker)
topic = "test-topic"
measTopic = "test-topic/measurments"
client_id = f'publish-123'

# sleeping time after publishing a message
sleeping_time = 3

# username = 'bash'  # MQTT broker username (use only with private broker)
# password = 'root'  # MQTT broker password (use only with private broker)
# ca_certs_path = "../src/bin/emqxsl-ca.crt"  # Path to your CA certificate (use only with private broker)

# Global variable to keep track of the last sent dummy data type
last_sent_dummy = "dummy1"

# Initialize the Sense HAT
sense = SenseHat()

# Global variables to store the last printed timestamp and UUID
last_timestamp = None
vessel_uuid = None
def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}\n")

    client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION1, client_id)
    client.on_connect = on_connect
    # For Private broker
    # client.username_pw_set(username, password)  # Set MQTT username and password
    # client.tls_set(ca_certs="/home/basho/TestFolder/emqxsl-ca.crt", tls_version=mqtt_client.ssl.PROTOCOL_TLS) # Set MQTT TLS certificate

    client.connect(broker, port)
    return client

def get_mode_from_input():
    while True:
        mode = input("Enter the mode (live, dummy0, dummy1, mixed): ")
        if mode.lower() in ["live", "dummy0", "dummy1", "mixed"]:
            return mode.lower()
        else:
            print("Invalid mode. Please enter a valid mode.")

mode = get_mode_from_input()


def generate_longitude_path():
    global min_longitude, max_longitude, current_longitude
    min_longitude = 51
    max_longitude = 52
    try:
        current_longitude = generate_random_path(min_longitude, max_longitude, current_longitude, 0.001)
    except:
        current_longitude = generate_longitude()
    return round(current_longitude, 6)

def generate_latitude_path():
    global min_latitude, max_latitude, current_latitude
    min_latitude = 25
    max_latitude = 26
    try:
        current_latitude = generate_random_path(min_latitude, max_latitude, current_latitude, 0.001)
    except:
        current_latitude = generate_latitude()
    return round(current_latitude, 6)

def generate_longitude():
    min_longitude = 51
    max_longitude = 52
    longitude_range = max_longitude - min_longitude
    random_longitude = random.uniform(min_longitude, max_longitude)
    return round(random_longitude, 6)

def generate_latitude():
    min_latitude = 25
    max_latitude = 26
    latitude_range = max_latitude - min_latitude
    random_latitude = random.uniform(min_latitude, max_latitude)
    return round(random_latitude, 6)

def generate_random_path(min_value, max_value, current_value, step):
    new_value = current_value + random.uniform(-step, step)
    if new_value < min_value:
        new_value = min_value
    elif new_value > max_value:
        new_value = max_value
    return new_value

def get_dummy0():
    # Returns a predefined dummy Signal K data with randomized longitude and latitude
    return {
        "updates": [{
            "source": {
                "sentence": "RMC", 
                "talker": "GN", 
                "type": "NMEA0183", 
                "label": "gps"}, 
            "timestamp": "2024-06-11T06:21:39.000Z", 
            "values": [{
                "path": "navigation.position", "value": {
                    "longitude": generate_longitude_path(), 
                    "latitude": generate_latitude_path()}}, 
                {"path": "navigation.courseOverGroundTrue", "value": 9}, 
                {"path": "navigation.speedOverGround", "value": 50}, 
                {"path": "navigation.magneticVariation", "value": 21},
                {"path": "navigation.magneticVariationAgeOfService", "value": 1718086899}, 
                {"path": "navigation.datetime", "value": "2024-06-11T06:21:39.000Z"}], 
            "$source": "gps.GN"}], 
        "context": "vessels.urn:mrn:signalk:uuid:live_dummy_0"
    }

def get_dummy1():
    # Returns a predefined dummy Signal K data with randomized longitude and latitude
    return {
        "updates": [{
            "source": {
                "sentence": "RMC", 
                "talker": "GN", 
                "type": "NMEA0183", 
                "label": "gps"}, 
            "timestamp": "2024-06-11T06:21:39.000Z", 
            "values": [{
                "path": "navigation.position", "value": {
                    "longitude": generate_longitude_path(), 
                    "latitude": generate_latitude_path()}}, 
                {"path": "navigation.courseOverGroundTrue", "value": 9}, 
                {"path": "navigation.speedOverGround", "value": 50}, 
                {"path": "navigation.magneticVariation", "value": 21},
                {"path": "navigation.magneticVariationAgeOfService", "value": 1718086899}, 
                {"path": "navigation.datetime", "value": "2024-06-11T06:21:39.000Z"}], 
            "$source": "gps.GN"}], 
        "context": "vessels.urn:mrn:signalk:uuid:live_dummy_1"
    }

def get_dummy2():
    # Returns a predefined dummy Signal K data with randomized longitude and latitude
    return {
        "updates": [{
            "source": {
                "sentence": "RMC", 
                "talker": "GN", 
                "type": "NMEA0183", 
                "label": "gps"}, 
            "timestamp": "2024-06-11T06:21:39.000Z", 
            "values": [{
                "path": "navigation.position", "value": {
                    "longitude": generate_longitude_path(), 
                    "latitude": generate_latitude_path()}}, 
                {"path": "navigation.courseOverGroundTrue", "value": 9}, 
                {"path": "navigation.speedOverGround", "value": 50}, 
                {"path": "navigation.magneticVariation", "value": 21},
                {"path": "navigation.magneticVariationAgeOfService", "value": 1718086899}, 
                {"path": "navigation.datetime", "value": "2024-06-11T06:21:39.000Z"}], 
            "$source": "gps.GN"}], 
        "context": "vessels.urn:mrn:signalk:uuid:f0c128b7-c7ea-402f-bc86-f6dea0d67080"
    }

def get_dummy_ais():
    # Returns a predefined dummy AIS data for other vessels
    return {
        "context": "vessels.urn:mrn:imo:mmsi:466538590",
        "updates": [
            {
                "source": {
                    "sentence": "VDM",
                    "talker": "AI",
                    "type": "NMEA0183",
                    "label": "daisy"
                },
                "$source": "daisy.AI",
                "timestamp": "2024-07-03T02:28:57.327Z",
                "values": [
                    {
                        "path": "",
                        "value": {"mmsi": "466538590"}
                    },
                    {
                        "path": "navigation.speedOverGround",
                        "value": 0  # You can randomize this value
                    },
                    {
                        "path": "navigation.courseOverGroundTrue",
                        "value": 3.932226805641068  # You can randomize this value
                    },
                    {
                        "path": "navigation.position",
                        "value": {
                            "longitude": generate_longitude_path(),  # You can randomize this value
                            "latitude": generate_latitude_path()  # You can randomize this value
                        }
                    },
                    {
                        "path": "sensors.ais.class",
                        "value": "B"
                    }
                ]
            }
        ]
    }

def get_dummy_measurements():
    return {
        "vessel_uuid": "live_dummy_0",
        "temperature": round(random.uniform(20, 30), 2),
        "humidity": round(random.uniform(40, 60), 2),
        "pressure": round(random.uniform(1000, 1020), 2),
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

async def publishNavMessage(client, message):
    data = json.loads(message)
    payload = json.dumps(data)
    await asyncio.sleep(1)  # Add a delay of 1 second
    # Check if latitude or longitude are null
    for update in data.get("updates", []):
        for value in update.get("values", []):
            if value.get("path") == "navigation.position":
                position = value.get("value", {})
                try:
                    lat = position.get("latitude")
                    lon = position.get("longitude")
                    if not (isinstance(lat, (int, float)) and isinstance(lon, (int, float))):
                        raise ValueError("Latitude or Longitude is not a number.")
                except (TypeError, ValueError) as e:
                    print(f"Error in position data: {e}. Skipping message.")
                    return
    result = client.publish(topic, payload)
    status = result[0]
    if status == mqtt_client.MQTT_ERR_SUCCESS:
        print(f"Send `{payload}` to topic `{topic}`")
    else:
        print(f"Failed to send message to topic {topic}")

# Function to read sensor values
def read_sensors():
    pressure = sense.get_pressure()
    temperature = sense.get_temperature()
    humidity = sense.get_humidity()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return {
        "pressure": pressure,
        "temperature": temperature,
        "humidity": humidity,
        "timestamp": timestamp
    }


async def publishMeasMessage(client, message):
    data = json.loads(message)
    payload = json.dumps(data)
    await asyncio.sleep(1)  # Add a delay of 1 second
    result = client.publish(measTopic, payload)
    status = result[0]
    if status == mqtt_client.MQTT_ERR_SUCCESS:
        print(f"Send `{payload}` to topic `{measTopic}`")
    else:
        print(f"Failed to send message to topic {measTopic}")

async def handleMeasMessage(message):
    global vessel_uuid

    try:
        data = json.loads(message)
        context = data.get("context", "")
        
        # Extract UUID using regex if it's not already set
        if vessel_uuid is None:
            match = re.search(r'urn:mrn:signalk:uuid:([\w-]+)', context)
            if match:
                vessel_uuid = match.group(1)
                print(f"UUID set to: {vessel_uuid}")
            else:
                print("UUID not found in the context")
    except Exception as e:
        print(f"Error handling message: {e}")
        print(f"Received message: {message}")

async def subscribe(websocket):
    # Unsubscribe from the default context
    unsubscribe_message = {
        "context": "*",
        "unsubscribe": [
            {"path": "*"}
        ]
    }
    await websocket.send(json.dumps(unsubscribe_message))

    # Subscribe to all contexts
    subscribe_message = {
        "context": "*",
        "subscribe": [
            {
                "path": "*",
                # "period": 1000,  # Optional: Set the desired period
                # "format": "delta",  # Optional: Specify the format (delta or full)
                # "policy": "ideal",  # Optional: Set the subscription policy (instant, ideal, or fixed)
                # "minPeriod": 200  # Optional: Set the minimum period for instant policy
            }
        ]
    }
    await websocket.send(json.dumps(subscribe_message))

async def send_dummy_data(client):
    global last_sent_dummy
    while True:
        if mode == "dummy0":
            data = get_dummy0()
            last_sent_dummy = "dummy0"  # Update last sent dummy type
        elif mode == "dummy1":
            data = get_dummy1()
            last_sent_dummy = "dummy1"  # Update last sent dummy type
        elif mode == "mixed":
            # Toggle between dummy0, dummy1, and dummy_ais based on the last sent type
            if last_sent_dummy == "dummy0":
                data = get_dummy1()
                last_sent_dummy = "dummy1"
            elif last_sent_dummy == "dummy1":
                data = get_dummy_ais()
                last_sent_dummy = "dummy_ais"
            elif last_sent_dummy == "dummy_ais":
                data = get_dummy2()
                last_sent_dummy = "dummy2"
            elif last_sent_dummy == "dummy2":
                data = get_dummy_measurements()
                last_sent_dummy = "dummy_measurements"
            else:
                data = get_dummy0()
                last_sent_dummy = "dummy0"
        payload = json.dumps(data)
        if last_sent_dummy == "dummy_measurements":
            result = client.publish(topic + "/measurments", payload)
        else:
            result = client.publish(topic, payload)
        status = result[0]
        if status == mqtt_client.MQTT_ERR_SUCCESS:
            print(f"Sent `{payload}` to topic `{topic}`")
        else:
            print(f"Failed to send message to topic {topic}")
        await asyncio.sleep(sleeping_time)  # Adjust the sleep time as needed

async def send_sensor_data(mqtt_client):
    global last_timestamp

    while True:
        sensor_data = read_sensors()
        if vessel_uuid:
            sensor_data["vessel_uuid"] = vessel_uuid
            current_timestamp = sensor_data["timestamp"]
            if current_timestamp != last_timestamp:
                sensor_json = json.dumps(sensor_data, indent=4)
                print(sensor_json)
                await publishMeasMessage(mqtt_client, sensor_json)
                last_timestamp = current_timestamp
            else:
                print("Same timestamp, message ignored.")
        else:
            print("UUID not set, waiting for UUID...")
        await asyncio.sleep(2)

async def main():
    while True:
        try:
            mqtt_client = connect_mqtt()
            mqtt_client.loop_start()

            if mode != "live":
                asyncio.create_task(send_dummy_data(mqtt_client))

            sensor_data_task = asyncio.create_task(send_sensor_data(mqtt_client))

            async with websockets.connect(WEBSOCKET_URL) as websocket:
                await subscribe(websocket)
                async for message in websocket:
                    await publishNavMessage(mqtt_client, message)
                    await handleMeasMessage(message)
        except websockets.exceptions.ConnectionClosedError as e:
            print(f"WebSocket connection closed with error: {e}. Attempting to reconnect...")
            await asyncio.sleep(5)  # Wait for 5 seconds before attempting to reconnect
        except KeyboardInterrupt:
            print("Interrupted by user")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}. Attempting to recover...")
            await asyncio.sleep(5)  # Wait for 5 seconds before attempting to recover
        finally:
            mqtt_client.loop_stop()
            mqtt_client.disconnect()
            print("MQTT client stopped. Attempting to restart...")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        print("Interrupted by user")
    finally:
        # Cancel all running tasks
        tasks = asyncio.all_tasks(loop)
        for task in tasks:
            task.cancel()
            try:
                loop.run_until_complete(task)
            except asyncio.CancelledError:
                pass

        loop.run_until_complete(loop.shutdown_asyncgens())
        loop.close()
        print("Event loop closed")
