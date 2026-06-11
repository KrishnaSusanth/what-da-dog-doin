import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth' 
import { useProfile } from './hooks/useProfile'
import { useDogs } from './hooks/useDogs'

import Login from './Login'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import MapPanel from './components/MapPanel'
import AddDogModal from './components/modals/AddDogModal'
import ActivityModal from './components/modals/ActivityModal'
import UserProfile from './components/UserProfile'

export default function App() {
  const { user, loading } = useAuth()
  const { profile: fetchedProfile } = useProfile(user?.id)
  
  // Local state to hold the profile data immediately on signup
  const [signupProfile, setSignupProfile] = useState(null)

  // Clear signup profile fallback if the user logs out
  useEffect(() => {
    if (!user) {
      setSignupProfile(null)
    }
  }, [user])

  // Single Source of Truth: Use the signup profile if it exists, otherwise fall back to fetched profile
  const profile = signupProfile || fetchedProfile
  
  const { dogs, addDog, loading: dogsLoading } = useDogs(user, profile)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [currentView, setCurrentView] = useState('feed') 
  const [radius, setRadius] = useState(5)

  // Sync radius state when profile maps coordinates/settings
  useEffect(() => {
    if (profile?.interest_radius_meters) {
      setRadius(profile.interest_radius_meters / 1000)
    }
  }, [profile])

  // Clean loading state
  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading WhatDaDogDoin... 🐾</div>
  }

  // Secure gate - Pass down setSignupProfile so Login/Signup can pass up new user data instantly
  if (!user) {
    return <Login onSignupComplete={(newProfile) => setSignupProfile(newProfile)} />
  }

  const myPack = dogs ? dogs.filter(d => d.created_by === user.id) : []

  return (
    <div style={layoutGridStyle}>
      {/* LEFT - Sidebar with user info */}
      <Sidebar user={user} profile={profile} onProfileClick={() => setCurrentView('profile')} />

      {/* CENTER */}
      <main style={{ padding: '20px' }}>
        {currentView === 'profile' ? (
          <UserProfile
            user={user}
            profile={profile}
            onClose={() => setCurrentView('feed')}
          />
        ) : (
          <>
            {/* MY PACK */}
            <section style={{ marginBottom: '25px' }}>
              <h3 style={sectionHeaderStyle}>My Pack</h3>

              <div style={storyScrollContainer}>
                <div style={addStoryCard} onClick={() => setIsAddOpen(true)}>+</div>

                {myPack.map(dog => (
                  <div key={dog.id} style={storyCard}>
                    <img
                      src={dog.main_image_url || 'https://via.placeholder.com/60'}
                      style={storyAvatarStyle}
                      alt={dog.name}
                    />
                    <span style={storyNameStyle}>{dog.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ACTIONS */}
            <div style={actionRowStyle}>
              <button onClick={() => setIsAddOpen(true)} style={primaryActionBtn}>
                ➕ Report Sighting
              </button>
              <button onClick={() => setIsActivityOpen(true)} style={secondaryActionBtn}>
                📝 Log Activity
              </button>
            </div>

            {/* FEED */}
            <Feed dogs={dogs || []} />
          </>
        )}
      </main>

      {/* RIGHT */}
      {currentView !== 'profile' && (
        <aside style={rightSidebarStyle}>
        <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <MapPanel dogs={dogs || []} user={user} profile={profile} />

          {/* RADIUS */}
          <div style={cardStyle}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              Radius: {radius} km
            </p>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* NEARBY */}
          <div style={cardStyle}>
            <h4 style={{ margin: '0 0 10px 0' }}>Nearby Legends</h4>

            {(dogs || []).slice(0, 3).map(dog => (
              <div key={dog.id} style={nearbyItemStyle}>
                <img src={dog.main_image_url || 'https://via.placeholder.com/35'} style={avatarSmallStyle} alt={dog.name} />
                <span>{dog.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      )}

      {/* MODALS */}
      {isAddOpen && (
        <AddDogModal
          onClose={() => setIsAddOpen(false)}
          onSubmit={addDog}
          userId={user.id}
          loading={dogsLoading}
        />
      )}

      {isActivityOpen && (
        <ActivityModal 
          dogs={dogs || []}
          userId={user.id}
          onClose={() => setIsActivityOpen(false)}
        />
      )}
    </div>
  )
}

//// --- STYLES ---

const layoutGridStyle = {
  display: 'grid',
  gridTemplateColumns: '280px 1fr 340px',
  minHeight: '100vh',
  background: '#f0f2f5',
  fontFamily: 'system-ui'
}

const rightSidebarStyle = {
  padding: '20px',
  borderLeft: '1px solid #ddd'
}

const sectionHeaderStyle = {
  fontSize: '1.1rem',
  color: '#444',
  marginBottom: '15px'
}

const storyScrollContainer = {
  display: 'flex',
  gap: '15px',
  overflowX: 'auto'
}

const storyCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '70px'
}

const addStoryCard = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: '2px dashed #ccc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer'
}

const storyAvatarStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: '3px solid #1877f2',
  objectFit: 'cover'
}

const storyNameStyle = { fontSize: '0.75rem' }

const actionRowStyle = { display: 'flex', gap: '15px', marginBottom: '30px' }

const primaryActionBtn = {
  flex: 1,
  padding: '15px',
  background: '#1877f2',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer'
}

const secondaryActionBtn = {
  flex: 1,
  padding: '15px',
  background: '#fff',
  color: '#1877f2',
  border: '1px solid #1877f2',
  borderRadius: '10px',
  cursor: 'pointer'
}

const cardStyle = {
  background: '#fff',
  padding: '15px',
  borderRadius: '12px',
  border: '1px solid #ddd'
}

const nearbyItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px'
}

const avatarSmallStyle = {
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  objectFit: 'cover'
}