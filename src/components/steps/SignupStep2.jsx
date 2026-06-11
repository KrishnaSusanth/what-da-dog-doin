export default function SignupStep2({ formData, updateFormData, onNext, onBack, loading }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Personal Details</h2>

      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={e => updateFormData({ firstName: e.target.value })}
        style={inputStyle}
        required
      />

      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={e => updateFormData({ lastName: e.target.value })}
        style={inputStyle}
        required
      />

      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={e => updateFormData({ username: e.target.value })}
        style={inputStyle}
        required
      />
      <small style={{ color: '#666', display: 'block', marginTop: '-12px', marginBottom: '15px' }}>
        Unique username for your profile
      </small>

      <input
        type="date"
        value={formData.dateOfBirth}
        onChange={e => updateFormData({ dateOfBirth: e.target.value })}
        style={inputStyle}
        required
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
          onClick={onNext}
          disabled={loading}
          style={{ ...buttonStyle, flex: 1 }}
        >
          {loading ? 'Checking...' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '1rem',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
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
