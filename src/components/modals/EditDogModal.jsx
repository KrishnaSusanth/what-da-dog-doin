import { useState, useEffect } from 'react'
import { updateDog } from '../../services/dogService'

export default function EditDogModal({ dog, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gender: 'Unknown',
    color: '',
    status: 'healthy',
    health_status: 'Healthy',
    is_neutered: false,
    is_vaccinated: false,
    friendliness_level: 3
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (dog) {
      setFormData({
        name: dog.name || '',
        description: dog.description || '',
        gender: dog.gender || 'Unknown',
        color: dog.color || '',
        status: dog.status || 'healthy',
        health_status: dog.health_status || 'Healthy',
        is_neutered: dog.is_neutered || false,
        is_vaccinated: dog.is_vaccinated || false,
        friendliness_level: dog.friendliness_level || 3
      })
    }
  }, [dog])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await updateDog(dog.id, formData)
      console.log('✅ Dog updated successfully')
      onSave()
      onClose()
    } catch (err) {
      console.error('❌ Error updating dog:', err)
      setError(err.message || 'Failed to update dog')
      setLoading(false)
    }
  }

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }

  const contentStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  }

  const checkboxStyle = {
    marginRight: '8px',
    cursor: 'pointer'
  }

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white'
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px' }}>Edit Dog</h2>

        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Dog Name"
            value={formData.name}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
          />

          <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
            <option value="Unknown">Unknown</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            type="text"
            name="color"
            placeholder="Color/Markings"
            value={formData.color}
            onChange={handleChange}
            style={inputStyle}
          />

          <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
            <option value="healthy">Healthy</option>
            <option value="injured">Injured</option>
            <option value="sick">Sick</option>
            <option value="lost">Lost</option>
          </select>

          <select name="health_status" value={formData.health_status} onChange={handleChange} style={inputStyle}>
            <option value="Healthy">Healthy</option>
            <option value="Minor Issues">Minor Issues</option>
            <option value="Serious Issues">Serious Issues</option>
          </select>

          <label style={{ display: 'block', marginBottom: '15px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_neutered"
              checked={formData.is_neutered}
              onChange={handleChange}
              style={checkboxStyle}
            />
            Neutered/Spayed
          </label>

          <label style={{ display: 'block', marginBottom: '15px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_vaccinated"
              checked={formData.is_vaccinated}
              onChange={handleChange}
              style={checkboxStyle}
            />
            Vaccinated
          </label>

          <label style={{ display: 'block', marginBottom: '15px' }}>
            Friendliness Level (1-5):
            <input
              type="range"
              name="friendliness_level"
              min="1"
              max="5"
              value={formData.friendliness_level}
              onChange={handleChange}
              style={{ width: '100%', marginTop: '5px' }}
            />
            <span>{formData.friendliness_level}/5</span>
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
