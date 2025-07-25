'''import asyncio
import websockets  # type: ignore
import json

# cab_id -> list of connected passenger websockets
passenger_connections = {}

# cab_id -> latest location
cab_locations = {}

async def handler(websocket, path):
    async for message in websocket:
        data = json.loads(message)

        if data["type"] == "register_passenger":
            cab_id = data["cab_id"]
            if cab_id not in passenger_connections:
                passenger_connections[cab_id] = []
            passenger_connections[cab_id].append(websocket)
            print(f"Passenger registered for cab: {cab_id}")

        elif data["type"] == "update_location":
            cab_id = data["cab_id"]
            lat = data["lat"]
            lng = data["lng"]
            cab_locations[cab_id] = {"lat": lat, "lng": lng}
            print(f"Location update from cab {cab_id}: {lat}, {lng}")

            if cab_id in passenger_connections:
                for passenger_ws in passenger_connections[cab_id]:
                    try:
                        await passenger_ws.send(json.dumps({"lat": lat, "lng": lng, "cab_id": cab_id}))
                    except:
                        passenger_connections[cab_id].remove(passenger_ws)

async def main():
    print("WebSocket server starting on ws://localhost:8765")
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # Run forever

asyncio.run(main())'''


import asyncio
import websockets  # type: ignore
import json
import random

# cab_id -> list of connected passenger websockets
passenger_connections = {}

# cab_id -> latest location
cab_locations = {}

# Hardcoded cab ID
HARDCODED_CAB_ID = "CAB123"

async def handler(websocket):
    async for message in websocket:
        data = json.loads(message)

        if data["type"] == "register_passenger":
            cab_id = data["cab_id"]
            if cab_id not in passenger_connections:
                passenger_connections[cab_id] = []
            passenger_connections[cab_id].append(websocket)
            print(f"Passenger registered for cab: {cab_id}")

        elif data["type"] == "update_location":
            cab_id = data["cab_id"]
            lat = data["lat"]
            lng = data["lng"]
            cab_locations[cab_id] = {"lat": lat, "lng": lng}
            print(f"Location update from cab {cab_id}: {lat}, {lng}")

            if cab_id in passenger_connections:
                for passenger_ws in passenger_connections[cab_id]:
                    try:
                        await passenger_ws.send(json.dumps({"lat": lat, "lng": lng, "cab_id": cab_id}))
                    except:
                        passenger_connections[cab_id].remove(passenger_ws)

# Simulate a cab sending location updates
async def simulate_cab_movement():
    lat, lng = 13.0832, 80.2755 # Start from Chennai Central
    while True:
        # Simulate small movement
        lat += random.uniform(-0.0010, 0.0010)
        lng += random.uniform(-0.0010, 0.0010)

        # Update location
        cab_locations[HARDCODED_CAB_ID] = {"lat": lat, "lng": lng}
        print(f"[Simulated] Cab {HARDCODED_CAB_ID} location: {lat:.5f}, {lng:.5f}")

        # Send location to passengers
        if HARDCODED_CAB_ID in passenger_connections:
            for passenger_ws in passenger_connections[HARDCODED_CAB_ID]:
                try:
                    await passenger_ws.send(json.dumps({
                        "lat": lat,
                        "lng": lng,
                        "cab_id": HARDCODED_CAB_ID
                    }))
                except:
                    passenger_connections[HARDCODED_CAB_ID].remove(passenger_ws)

        await asyncio.sleep(2)  # update every 2 seconds

async def main():
    print("WebSocket server starting on ws://localhost:8765")
    server = websockets.serve(handler, "localhost", 8765)
    await asyncio.gather(server, simulate_cab_movement())

asyncio.run(main())
