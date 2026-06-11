import { MapContainer, TileLayer } from 'react-leaflet'
import { useState, useEffect, useRef } from 'react'
import LocationPicker from '../LocationPicker'

export default function AddDogModal({ onClose, onSubmit, userId, loading }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [lat, setLat] = useState(17.6868)
  const [lng, setLng] = useState(83.2185)
  const [address, setAddress] = useState('')

  // New states mapping directly to your public.stray_dogs columns
  const [gender, setGender] = useState('Unknown')
  const [color, setColor] = useState('')
  const [healthStatus, setHealthStatus] = useState('Healthy')
  const [isNeutered, setIsNeutered] = useState(false)
  const [isVaccinated, setIsVaccinated] = useState(false)
  const [friendliness, setFriendliness] = useState(3)

  const mapRef = useRef(null) 

  // Fix for Leaflet inside modal sizing bugs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const file = e.target.dogImage.files[0]

    // Bundles all input data to be sent directly to your hooks/supabase queries
    onSubmit({
      name,
      description: desc,
      file,
      userId,
      lat,
      lng,
      gender,
      color: color || null, // Sends null to database if left blank
      health_status: healthStatus,
      is_neutered: isNeutered,
      is_vaccinated: isVaccinated,
      friendliness_level: parseInt(friendliness, 10)
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
            placeholder="Dog's Name (e.g., Brownie, Unknown Pet)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <textarea
            placeholder="Describe behavior, noticeable marks, landmarks nearby..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{ ...inputStyle, height: '70px' }}
          />

          {/* NEW FIELD: COLOR */}
          <input
            type="text"
            placeholder="Coat Color (e.g., Tan and White, Black, Golden)"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={inputStyle}
          />

          {/* DROPDOWN ROWS */}
          <div style={rowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} style={selectStyle}>
                <option value="Unknown">Unknown</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Health Status</label>
              <select value={healthStatus} onChange={e => setHealthStatus(e.target.value)} style={selectStyle}>
                <option value="Healthy">Healthy</option>
                <option value="Injured">Injured</option>
                <option value="Sick">Sick</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Underweight">Underweight</option>
              </select>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Friendliness (1-5)</label>
              <select value={friendliness} onChange={e => setFriendliness(e.target.value)} style={selectStyle}>
                <option value="1">1 - Aggressive/Scared</option>
                <option value="2">2 - Avoidant</option>
                <option value="3">3 - Neutral</option>
                <option value="4">4 - Friendly</option>
                <option value="5">5 - Very Playful</option>
              </select>
            </div>
          </div>

          {/* CHECKBOX TOGGLES */}
          <div style={checkboxRowStyle}>
            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={isNeutered} 
                onChange={e => setIsNeutered(e.target.checked)} 
              />
              <span>Neutered / Spayed</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                checked={isVaccinated} 
                onChange={e => setIsVaccinated(e.target.checked)} 
              />
              <span>Vaccinated (Anti-Rabies)</span>
            </label>
          </div>

          {/* IMAGE UPLOAD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Dog Image</label>
            <input type="file" name="dogImage" accept="image/*" />
          </div>

          {/* MAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Pinpoint Location</label>
            <div style={mapWrapper}>
              <MapContainer
                center={[lat, lng]}
                zoom={13}
                ref={mapRef} 
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
          </div>

          {/* RENDERS REVERSE GEOCODED ADDRESS TEXT */}
          {address && (
            <div style={addressBoxStyle}>
              <strong>Sighting Location:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#555' }}>
                {address}
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? 'Uploading Details...' : 'Confirm Sighting'}
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
  maxWidth: '520px',
  maxHeight: '92vh',
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
  gap: '14px'
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxSizing: 'border-box'
}

const rowStyle = {
  display: 'flex',
  gap: '12px',
  width: '100%'
}

const formGroupStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
}

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#555'
}

const selectStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  background: '#fff',
  boxSizing: 'border-box'
}

const checkboxRowStyle = {
  display: 'flex',
  gap: '20px',
  margin: '4px 0'
}

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  color: '#444'
}

const mapWrapper = {
  height: '180px',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid #ddd'
}

const addressBoxStyle = {
  background: '#f9f9f9',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #eee',
  wordBreak: 'break-word'
}

const submitBtn = {
  padding: '12px',
  background: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  marginTop: '5px'
}