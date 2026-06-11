import { useState } from 'react'
import { logActivity } from '../../services/activityService'

export default function ActivityLogModal({ dog, userId, onClose, onActivityLogged }) {
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
      await logActivity(userId, dog.id, formData.actionType, formData.notes)
      console.log('✅ Activity logged successfully')
      onActivityLogged()
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
    maxWidth: '400px',
    width: '90%',
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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '10px' }}>Log Activity</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Dog: <strong>{dog.name}</strong>
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
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Logging...' : 'Log Activity'}
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
