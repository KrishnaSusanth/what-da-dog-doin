export default function SignupStep1({ formData, updateFormData, onNext, loading }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Create Account</h2>

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => updateFormData({ email: e.target.value })}
        style={inputStyle}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={e => updateFormData({ password: e.target.value })}
        style={inputStyle}
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={e => updateFormData({ confirmPassword: e.target.value })}
        style={inputStyle}
        required
      />

      <button 
        onClick={onNext}
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? 'Loading...' : 'Next →'}
      </button>
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
  width: '100%',
  padding: '12px',
  background: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background 0.3s',
  marginTop: '10px'
}
