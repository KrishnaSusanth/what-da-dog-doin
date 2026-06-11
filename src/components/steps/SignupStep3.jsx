import { MapContainer, TileLayer } from 'react-leaflet'
import { useRef, useEffect, useState } from 'react'
import AreaInterestPicker from '../AreaInterestPicker'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for broken default marker icons in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export default function SignupStep3({ formData, updateFormData, onSubmit, onBack, loading }) {
  const mapRef = useRef(null)
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      updateFormData({ profilePicture: file })
      setFileName(file.name)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Profile Setup</h2>

      {/* Profile Picture Upload */}
      <div style={uploadBoxStyle}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Profile Picture (Optional)
        </label>
        <div style={fileInputWrapperStyle}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="profilePic"
          />
          <label htmlFor="profilePic" style={fileUploadLabelStyle}>
            📷 Choose Picture
          </label>
          {fileName && <span style={{ marginLeft: '10px' }}>{fileName}</span>}
        </div>
      </div>

      {/* Area of Interest */}
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', marginTop: '20px' }}>
        Area of Interest
      </label>
      <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
        Click on the map to select your center location. The circle shows your interest area ({formData.interestRadius} km radius).
      </div>

      <div style={mapWrapperStyle}>
        <MapContainer
          center={[formData.interestLat, formData.interestLng]}
          zoom={13}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <AreaInterestPicker
            lat={formData.interestLat}
            lng={formData.interestLng}
            radius={formData.interestRadius}
            setLat={(lat) => updateFormData({ interestLat: lat })}
            setLng={(lng) => updateFormData({ interestLng: lng })}
            setAreaName={(name) => updateFormData({ areaName: name })}
          />
        </MapContainer>
      </div>

      {formData.areaName && (
        <div style={areaNameBoxStyle}>
          Selected Area: <strong>{formData.areaName}</strong>
        </div>
      )}

      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', marginTop: '20px' }}>
        Interest Radius: <strong>{formData.interestRadius} km</strong>
      </label>
      <input
        type="range"
        min="1"
        max="20"
        value={formData.interestRadius}
        onChange={e => updateFormData({ interestRadius: parseInt(e.target.value) })}
        style={{ width: '100%', marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={onBack}
          disabled={loading}
          style={{ ...buttonStyle, background: '#6c757d' }}
        >
          ← Back
        </button>
        <button 
          onClick={onSubmit}
          disabled={loading}
          style={{ ...buttonStyle, flex: 1 }}
        >
          {loading ? 'Creating Account...' : '✓ Complete Signup'}
        </button>
      </div>
    </div>
  )
}

const uploadBoxStyle = {
  background: '#f8f9fa',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  border: '1px solid #dee2e6'
}

const fileInputWrapperStyle = {
  display: 'flex',
  alignItems: 'center'
}

const fileUploadLabelStyle = {
  background: '#1877f2',
  color: '#fff',
  padding: '8px 15px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 'bold'
}

const mapWrapperStyle = {
  height: '350px',
  borderRadius: '8px',
  overflow: 'hidden',
  marginBottom: '15px',
  border: '1px solid #ddd'
}

const areaNameBoxStyle = {
  background: '#e7f3ff',
  border: '1px solid #91d5ff',
  padding: '10px',
  borderRadius: '6px',
  marginBottom: '15px',
  fontSize: '0.9rem',
  color: '#0050b3'
}

const buttonStyle = {
  padding: '12px',
  background: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background 0.3s'
}
