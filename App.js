/*import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '85vh'
};

const center = {
  lat: 0,
  lng: 0
};

function App() {
  const [cabId, setCabId] = useState('');
  const [eta, setEta] = useState('ETA: --');
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [cabLocation, setCabLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const socketRef = useRef(null);
  const directionsServiceRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR API KEY",
    libraries: ['places']
  });

  useEffect(() => {
    // Get passenger location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPassengerLocation(location);
        },
        () => {
          alert("Location access denied. Cannot show your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    return () => {
      // Clean up WebSocket connection on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const updateRoute = (cabLoc) => {
    if (!passengerLocation || !directionsServiceRef.current) return;

    directionsServiceRef.current.route(
      {
        origin: cabLoc,
        destination: passengerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const route = result.routes[0].legs[0];
          setEta(`ETA: ${route.duration.text}`);
        } else {
          console.error("Directions request failed due to " + status);
          setEta("ETA: --");
        }
      }
    );
  };

  const startTracking = () => {
    if (!cabId.trim()) {
      alert("Please enter a valid Cab ID.");
      return;
    }

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    socketRef.current = new WebSocket("ws://localhost:8765");

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: "register_passenger", cab_id: cabId }));
    };

    socketRef.current.onmessage = (event) => {
      const location = JSON.parse(event.data);
      const cabLatLng = {
        lat: location.lat,
        lng: location.lng
      };
      setCabLocation(cabLatLng);
      updateRoute(cabLatLng);
    };

    socketRef.current.onerror = (error) => {
      alert("WebSocket Error: " + error.message);
    };
  };

  return (
    <div>
      <div style={{ margin: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="cabIdInput">Cab ID:</label>
        <input
          type="text"
          id="cabIdInput"
          placeholder="e.g., CAB123"
          value={cabId}
          onChange={(e) => setCabId(e.target.value)}
        />
        <button onClick={startTracking}>Start Tracking</button>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginLeft: '10px' }}>{eta}</div>
      </div>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={passengerLocation || center}
          zoom={14}
        >
      
          {passengerLocation && (
            <Marker
              position={passengerLocation}
              title="Passenger"
              icon={{
                url: "https://th.bing.com/th/id/OIP.nzcTKj4BBh2FnmBeiZkrJgHaHk?w=198&h=202&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          )}

          
          {cabLocation && (
            <Marker
              position={cabLocation}
              title="Cab"
              icon={{
                url: "https://tse3.mm.bing.net/th/id/OIP.bJqAsuKYbESyhbJ2N6WAngHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          )}

          
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}
        </GoogleMap>
      ) : (
        <div>Loading Google Maps...</div>
      )}
    </div>
  );
}

export default App;*/

import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '85vh'
};

const center = {
  lat: 13.0827,
  lng: 80.2707 // Chennai
};

function App() {
  const [cabId, setCabId] = useState('CAB123'); // Default hardcoded
  const [eta, setEta] = useState('ETA: --');
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [cabLocation, setCabLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const socketRef = useRef(null);
  const directionsServiceRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR API KEY", // Replace with your own API key
    libraries: ['places']
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPassengerLocation(loc);
        },
        () => {
          alert("Location access denied.");
        }
      );
    }

    return () => {
      // Cleanup WebSocket on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && !directionsServiceRef.current && window.google) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }
  }, [isLoaded]);

  const updateRoute = (cabLoc) => {
    if (!passengerLocation || !directionsServiceRef.current || !window.google) return;

    directionsServiceRef.current.route(
      {
        origin: cabLoc,
        destination: passengerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setEta(`ETA: ${leg.duration.text}`);
        } else {
          console.error("Directions error:", status);
          setEta("ETA: --");
        }
      }
    );
  };

  const startTracking = () => {
    if (!cabId.trim()) {
      alert("Please enter a valid Cab ID.");
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    socketRef.current = new WebSocket("ws://localhost:8765");

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({
        type: "register_passenger",
        cab_id: cabId
      }));
    };

    socketRef.current.onmessage = (event) => {
      const location = JSON.parse(event.data);
      const cabLatLng = { lat: location.lat, lng: location.lng };
      setCabLocation(cabLatLng);
      updateRoute(cabLatLng);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert("WebSocket Error. Make sure server is running.");
    };

    socketRef.current.onclose = () => {
      console.warn("WebSocket closed.");
    };
  };

  return (
    <div>
      <div style={{ margin: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="cabIdInput">Cab ID:</label>
        <input
          type="text"
          id="cabIdInput"
          placeholder="e.g., CAB123"
          value={cabId}
          onChange={(e) => setCabId(e.target.value)}
        />
        <button onClick={startTracking}>Start Tracking</button>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginLeft: '10px' }}>{eta}</div>
      </div>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={passengerLocation || center}
          zoom={14}
        >
          
          {passengerLocation && (
            <Marker
              position={passengerLocation}
              title="Passenger"
              icon={{
                url: "https://th.bing.com/th/id/OIP.nzcTKj4BBh2FnmBeiZkrJgHaHk?w=198&h=202&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          )}
          {cabLocation && (
            <Marker
              position={cabLocation}
              title="Cab"
              icon={{
                url: "https://tse3.mm.bing.net/th/id/OIP.bJqAsuKYbESyhbJ2N6WAngHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          )}

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}
        </GoogleMap>
      ) : (
        <div>Loading Google Maps...</div>
      )}
    </div>
  );
}

export default App;