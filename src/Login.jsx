import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './supabaseClient'
import Signup from './components/Signup'

export default function Login({ onSignupComplete }) {
  const [isSignup, setIsSignup] = useState(false)

  if (isSignup) {
    return (
      <Signup 
        onSignupSuccess={(freshProfile) => {
          setIsSignup(false)
          // Relay data payload straight up to App.jsx state instantly
          if (onSignupComplete) {
            onSignupComplete(freshProfile)
          }
        }}
        onSwitchToLogin={() => setIsSignup(false)}
      />
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#1877f2', marginBottom: '30px' }}>🐾 What Da Dog Doin?</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <button 
            onClick={() => setIsSignup(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1877f2',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px'
}

const cardStyle = {
  background: '#fff',
  borderRadius: '15px',
  padding: '40px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
}