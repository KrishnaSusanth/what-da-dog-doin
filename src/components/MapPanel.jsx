import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// 1. IMPORT THE CSS (Crucial for tiles to align properly)
import 'leaflet/dist/leaflet.css';

// 2. FIX FOR BROKEN DEFAULT MARKER ICONS IN VITE/WEBPACK
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to handle map updates
function MapUpdater({ centerLat, centerLng, hasProfile }) {
  const map = useMap()
  const [lastCenter, setLastCenter] = useState(null)

  useEffect(() => {
    // Force map update when profile first becomes available
    if (!hasProfile) return
    
    const centerKey = `${centerLat}-${centerLng}`
    if (lastCenter === centerKey) return
    
    setLastCenter(centerKey)
    console.log('MapUpdater: Updating map center to:', centerLat, centerLng)
    if (map) {
      // Delay to ensure map is fully rendered
      setTimeout(() => {
        map.invalidateSize()
        map.setView([centerLat, centerLng], 12, { animate: true })
      }, 100)
    }
  }, [centerLat, centerLng, hasProfile, map, lastCenter])

  return null
}

export default function MapPanel({ dogs = [], user, profile }) {
  // Default to Visakhapatnam if no user preferences
  const centerLat = profile?.interest_center_lat || 17.6868
  const centerLng = profile?.interest_center_long || 83.2185
  const radiusKm = (profile?.interest_radius_meters || 2000) / 1000

  console.log('MapPanel rendering with profile:', profile)
  console.log('Center:', centerLat, centerLng, 'Radius:', radiusKm, 'Dogs:', dogs.length)

  return (
    <div style={wrapperStyle}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />

        {/* Update map when profile changes */}
        <MapUpdater centerLat={centerLat} centerLng={centerLng} hasProfile={!!profile} />

        {/* Show user's interest area circle */}
        {profile && (
          <Circle
            center={[centerLat, centerLng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#1877f2',
              fillColor: '#1877f2',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        )}

        {dogs && dogs.length > 0 ? (
          dogs.map(dog => (dog.last_location_lat && dog.last_location_long) ? (
            <Marker
              key={dog.id}
              position={[dog.last_location_lat, dog.last_location_long]}
            >
              <Popup>
                <strong>{dog.name}</strong> <br />
                Status: {dog.status} <br />
                {dog.description && <p>{dog.description}</p>}
              </Popup>
            </Marker>
          ) : null)
        ) : null}
      </MapContainer>
    </div>
  )
}

const wrapperStyle = {
  height: '400px',
  width: '100%',
  borderRadius: '15px',
  overflow: 'hidden',   
  border: '1px solid #ddd'
}