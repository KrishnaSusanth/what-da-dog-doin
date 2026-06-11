import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { createProfile, checkUsernameAvailable, uploadProfilePicture } from '../services/profileService'
import SignupStep1 from './steps/SignupStep1'
import SignupStep2 from './steps/SignupStep2'
import SignupStep3 from './steps/SignupStep3'

export default function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    profilePicture: null,
    interestLat: 17.6868,
    interestLng: 83.2185,
    interestRadius: 2,
    areaName: 'Visakhapatnam'
  })

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setError(null)
  }

  const handleStep1Submit = async () => {
    setError(null)
    
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setStep(2)
  }

  const handleStep2Submit = async () => {
    setError(null)
    
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.dateOfBirth) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      const available = await checkUsernameAvailable(formData.username)
      if (!available) {
        setError('Username already taken')
        setLoading(false)
        return
      }
      setLoading(false)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Error checking username')
      setLoading(false)
    }
  }

  const handleStep3Submit = async () => {
    setError(null)
    setLoading(true)

    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const userId = authData.user.id
      console.log('✅ Auth user created:', userId)

      // 2. Upload profile picture if provided
      let avatarUrl = null
      if (formData.profilePicture) {
        try {
          avatarUrl = await uploadProfilePicture(userId, formData.profilePicture)
        } catch (err) {
          console.error('Profile picture upload failed:', err)
        }
      }

      // 3. Create profile record variables
      const calculatedRadiusMeters = formData.interestRadius * 1000
      const profilePayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        date_of_birth: formData.dateOfBirth,
        avatar_url: avatarUrl,
        interest_center_lat: formData.interestLat,
        interest_center_long: formData.interestLng,
        interest_radius_meters: calculatedRadiusMeters,
        home_area_id: null
      }

      await createProfile(userId, profilePayload)
      console.log('✅ Profile created successfully')

      // Assemble complete object matching your database row mapping structure
      const freshProfileData = {
        id: userId,
        ...profilePayload,
        display_name: `${formData.firstName} ${formData.lastName}`,
        karma_points: 0
      }

      setLoading(false)
      
      // Fire callback with the fresh profile data object built in memory
      if (onSignupSuccess) {
        onSignupSuccess(freshProfileData)
      }
    } catch (err) {
      console.error('❌ Signup error:', err)
      
      let userMessage = err.message || 'Error creating profile'
      if (err.message?.includes('row-level security policy')) {
        userMessage = '⚠️ Database access issue. Check RLS policies on profiles table.'
      } else if (err.message?.includes('violates')) {
        userMessage = '⚠️ Profile data validation failed. Check your input or RLS policies.'
      }
      
      setError(userMessage)
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: 'center', color: '#1877f2', marginBottom: '30px' }}>🐾 Join WhatDaDogDoin</h1>
        
        <div style={progressBarStyle}>
          <div style={{ ...progressStepStyle, backgroundColor: step >= 1 ? '#1877f2' : '#ddd' }}></div>
          <div style={{ ...progressLineStyle, backgroundColor: step >= 2 ? '#1877f2' : '#ddd' }}></div>
          <div style={{ ...progressStepStyle, backgroundColor: step >= 2 ? '#1877f2' : '#ddd' }}></div>
          <div style={{ ...progressLineStyle, backgroundColor: step >= 3 ? '#1877f2' : '#ddd' }}></div>
          <div style={{ ...progressStepStyle, backgroundColor: step >= 3 ? '#1877f2' : '#ddd' }}></div>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}

        {step === 1 && (
          <SignupStep1 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleStep1Submit}
            loading={loading}
          />
        )}

        {step === 2 && (
          <SignupStep2 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleStep2Submit}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}

        {step === 3 && (
          <SignupStep3 
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleStep3Submit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#1877f2',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Login
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
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
}

const progressBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '30px'
}

const progressStepStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  transition: 'background-color 0.3s'
}

const progressLineStyle = {
  width: '40px',
  height: '3px',
  transition: 'background-color 0.3s'
}

const errorBoxStyle = {
  background: '#fee',
  color: '#c33',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '0.9rem',
  border: '1px solid #fcc'
}