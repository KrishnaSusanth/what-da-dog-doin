// This is a test comment to verify the main branch sync!

import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useDogs } from './hooks/useDogs'

import Login from './Login'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import MapPanel from './components/MapPanel'
import AddDogModal from './components/modals/AddDogModal'
import ActivityModal from './components/modals/ActivityModal'

export default function App() {
  const session = useAuth()
  const { dogs, addDog, loading } = useDogs(session)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [radius, setRadius] = useState(5)

  if (!session) return <Login />

  const myPack = dogs.filter(d => d.created_by === session.user.id)

  return (
    <div style={layoutGridStyle}>
      
      {/* LEFT */}
      <Sidebar user={session.user} />

      {/* CENTER */}
      <main style={{ padding: '20px' }}>

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
        <Feed dogs={dogs} />

      </main>

      {/* RIGHT */}
      <aside style={rightSidebarStyle}>
        <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <MapPanel dogs={dogs} />

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

            {dogs.slice(0, 3).map(dog => (
              <div key={dog.id} style={nearbyItemStyle}>
                <img src={dog.main_image_url} style={avatarSmallStyle} />
                <span>{dog.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MODALS */}
      {isAddOpen && (
        <AddDogModal
          onClose={() => setIsAddOpen(false)}
          onSubmit={addDog}
          userId={session.user.id}
          loading={loading}
        />
      )}

      {isActivityOpen && (
        <ActivityModal onClose={() => setIsActivityOpen(false)} />
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