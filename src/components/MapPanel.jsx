import { MapContainer, TileLayer, Marker } from 'react-leaflet'

export default function MapPanel({ dogs }) {
  return (
    <div style={wrapperStyle}>
      <MapContainer
        center={[17.7665, 83.3590]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {dogs.map(dog => dog.last_location_lat && (
          <Marker
            key={dog.id}
            position={[dog.last_location_lat, dog.last_location_long]}
          />
        ))}
      </MapContainer>
    </div>
  )
}

const wrapperStyle = {
  height: '220px',
  borderRadius: '15px',
  overflow: 'hidden',   // 🔥 THIS FIXES THE BUG
  border: '1px solid #ddd'
}