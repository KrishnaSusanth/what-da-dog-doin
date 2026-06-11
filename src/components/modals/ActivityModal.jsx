import { useState } from 'react'
import { logActivity } from '../../services/activityService'

export default function ActivityModal({ dogs, userId, onClose, onActivityLogged }) {
  const [step, setStep] = useState('select') // 'select' or 'form'
  const [selectedDog, setSelectedDog] = useState(null)
  const [formData, setFormData] = useState({
    actionType: 'Spotted',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const actionTypes = [
    'Spotted',
    'Feeding',
    'Medical Care',
    'Rescue',
    'Rehoming',
    'Health Check',
    'Vaccination',
    'Surgery',
    'Follow-up',
    'Other'
  ]

  const handleSelectDog = (dog) => {
    setSelectedDog(dog)
    setStep('form')
    setError(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await logActivity(userId, selectedDog.id, formData.actionType, formData.notes)
      console.log('✅ Activity logged successfully')
      if (onActivityLogged) {
        onActivityLogged()
      }
      onClose()
    } catch (err) {
      console.error('❌ Error logging activity:', err)
      setError(err.message || 'Failed to log activity')
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
    maxWidth: '450px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }

  const dogListStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px'
  }

  const dogItemStyle = {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    background: 'white'
  }

  const dogItemHoverStyle = {
    ...dogItemStyle,
    background: '#f0f2f5',
    borderColor: '#007bff'
  }

  const dogImageStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '4px',
    objectFit: 'cover'
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

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: 'white'
  }

  const backButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    marginRight: '10px'
  }

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d'
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        {step === 'select' ? (
          <>
            <h2 style={{ marginBottom: '20px' }}>Select a Dog</h2>
            
            {error && (
              <div style={{ color: '#d32f2f', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            {dogs && dogs.length > 0 ? (
              <div style={dogListStyle}>
                {dogs.map(dog => (
                  <div
                    key={dog.id}
                    style={dogItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f2f5'
                      e.currentTarget.style.borderColor = '#007bff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#ddd'
                    }}
                    onClick={() => handleSelectDog(dog)}
                  >
                    {dog.main_image_url ? (
                      <img src={dog.main_image_url} alt={dog.name} style={dogImageStyle} />
                    ) : (
                      <div style={{ ...dogImageStyle, background: '#ddd' }} />
                    )}
                    <div>
                      <p style={{ margin: '0', fontWeight: 'bold' }}>{dog.name}</p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                        {dog.status || 'Unknown status'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>No dogs available</p>
            )}

            <div style={{ marginTop: '20px' }}>
              <button onClick={onClose} style={cancelButtonStyle}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '10px' }}>Log Activity</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Dog: <strong>{selectedDog?.name}</strong>
            </p>

            {error && (
              <div style={{ color: '#d32f2f', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                Activity Type
              </label>
              <select
                name="actionType"
                value={formData.actionType}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                Notes
              </label>
              <textarea
                name="notes"
                placeholder="Add any details about this activity..."
                value={formData.notes}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('select')
                    setFormData({ actionType: 'Spotted', notes: '' })
                  }}
                  style={backButtonStyle}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={buttonStyle}
                >
                  {loading ? 'Logging...' : 'Log Activity'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}