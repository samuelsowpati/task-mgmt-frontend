import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LocationMarker from './LocationMarker';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Map2({ aloc, setShowMap }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Use the name from aloc or a default if not provided
  const locationName = aloc.name || "Task Location";

  const handleLocationClick = () => {
    setSelectedLocation({
      name: locationName,
      coordinates: { lat: aloc.lat, lng: aloc.long }
    });
    setIsOpen(true);
  };

  const yellowIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U5YjQwMCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDIgMC04LTMuNTgtOC04czMuNTgtOCA4LTggOCAzLjU4IDggOC0zLjU4IDgtOCA4eiIvPjxwYXRoIGZpbGw9IiNlOWI0MDAiIGQ9Ik0xMiA2Yy0zLjMxIDAtNiAyLjY5LTYgNnMyLjY5IDYgNiA2IDYtMi42OSA2LTYtMi42OS02LTYtNnoiLz48L3N2Zz4=',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 p-4">
      <div className="bg-zinc-800 border border-yellow-500 rounded-lg p-4 text-white shadow-md 
                    transition duration-300 ease-in-out hover:shadow-xl hover:border-green-400 
                    hover:scale-[1.01] w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-yellow-300">Location Map</h2>
          <button
            onClick={() => setShowMap(false)}
            className="text-white hover:text-red-500 transition-colors duration-300"
          >
            ✕
          </button>
        </div>
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
          <MapContainer 
            center={[aloc.lat, aloc.long]} 
            zoom={17} 
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker
              position={[aloc.lat, aloc.long]}
              icon={yellowIcon}
              eventHandlers={{
                click: handleLocationClick,
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                }
              }}
            >
              <Popup className="bg-zinc-800 border border-yellow-500 text-white">
                <div className="p-2">
                  <strong className="text-orange-500">{locationName}</strong>
                </div>
              </Popup>
            </Marker>
            
            {/* Current location marker */}
            <LocationMarker />
          </MapContainer>

          {/* Dialog Box */}
          {isOpen && selectedLocation && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-zinc-800 p-6 rounded-lg border border-yellow-500 shadow-xl 
                            transform transition-all duration-300 hover:border-green-400 
                            hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                  {selectedLocation.name}
                </h3>
                <div className="space-y-4">
                  <p className="text-white">Location Details:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-gray-400">Coordinates:</div>
                    <div className="text-white">
                      Lat: {aloc.lat.toFixed(4)}, Lng: {aloc.long.toFixed(4)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-green-400 
                           transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
