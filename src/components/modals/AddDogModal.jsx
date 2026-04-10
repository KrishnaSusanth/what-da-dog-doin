import { MapContainer, TileLayer } from 'react-leaflet'
import { useState, useEffect, useRef } from 'react'
import LocationPicker from '../LocationPicker'

export default function AddDogModal({ onClose, onSubmit, userId, loading }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [lat, setLat] = useState(17.6868)
  const [lng, setLng] = useState(83.2185)
  const [address, setAddress] = useState('')

  const mapRef = useRef()

  // 🔥 Fix for Leaflet inside modal
  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 100)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()

    const file = e.target.dogImage.files[0]

    onSubmit({
      name,
      description: desc,
      file,
      userId,
      lat,
      lng
    })

    onClose()
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        
        {/* HEADER */}
        <div style={header}>
          <h2>New Sighting</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={formStyle}>
          
          <input
            type="text"
            placeholder="Dog's Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <textarea
            placeholder="Description..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{ ...inputStyle, height: '80px' }}
          />

          <input type="file" name="dogImage" accept="image/*" />

          {/* MAP */}
          <div style={mapWrapper}>
            <MapContainer
              center={[lat, lng]}
              zoom={13}
              whenCreated={(map) => (mapRef.current = map)}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                lat={lat}
                lng={lng}
                setLat={setLat}
                setLng={setLng}
                setAddress={setAddress}
              />
            </MapContainer>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? 'Uploading...' : 'Confirm Sighting'}
          </button>

        </form>
      </div>
    </div>
  )
}

//// --- STYLES ---

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
}

const modal = {
  background: '#fff',
  padding: '25px',
  borderRadius: '15px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto'
}

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '15px'
}

const closeBtn = {
  border: 'none',
  background: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer'
}

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd'
}

const mapWrapper = {
  height: '200px',
  borderRadius: '10px',
  overflow: 'hidden'
}

const submitBtn = {
  padding: '12px',
  background: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
}