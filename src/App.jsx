import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// --- HELPER COMPONENTS ---
function LocationPicker({ setLat, setLng, lat, lng, setAddress }) {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat)
      setLng(e.latlng.lng)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => setAddress(data.display_name || "Address not found"))
        .catch(err => console.error("Geocoding error:", err));
    },
  })
  return <Marker position={[lat, lng]} />
}

function App() {
  // --- STATE ---
  const [session, setSession] = useState(null)
  const [dogs, setDogs] = useState([])
  const [isAddDogOpen, setIsAddDogOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [radius, setRadius] = useState(5) // Radius in km

  // Form State (Add Dog)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(17.6868)
  const [lng, setLng] = useState(83.2185)
  const [uploading, setUploading] = useState(false)

  // --- DATA LOGIC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) getDogs()
  }, [session])

  async function getDogs() {
    const { data } = await supabase.from('stray_dogs').select('*').order('created_at', { ascending: false })
    setDogs(data || [])
  }

  async function addDog(e) {
    e.preventDefault()
    setUploading(true)
    const file = e.target.dogImage.files[0]
    let publicUrl = ''

    if (file) {
      const fileName = `${Date.now()}_${file.name}`
      const { data } = await supabase.storage.from('dog-photos').upload(fileName, file)
      const { data: urlData } = supabase.storage.from('dog-photos').getPublicUrl(fileName)
      publicUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('stray_dogs').insert([{
      name: newName, description: newDesc, main_image_url: publicUrl,
      created_by: session.user.id, last_location_lat: lat, last_location_long: lng
    }])

    if (!error) {
      setNewName(''); setNewDesc(''); setIsAddDogOpen(false); getDogs()
    }
    setUploading(false)
  }

  if (!session) return <Login />

  // Filter "My Pack" (Dogs I created - for now)
  const myPack = dogs.filter(dog => dog.created_by === session.user.id)

  return (
    <div style={layoutGridStyle}>
      
      {/* --- LEFT SIDEBAR (STICKY) --- */}
      <aside style={sidebarStyle}>
        <div style={{ position: 'sticky', top: '20px' }}>
          <h2 style={{ color: '#1877f2', marginBottom: '25px' }}>🐾 WD Doin?</h2>
          <div style={profileCardStyle}>
            <div style={avatarLargeStyle}></div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{session.user.email.split('@')[0]}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#1877f2' }}>✨ 45 Karma</p>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
            <button style={navButtonStyle}>🏠 Home Feed</button>
            <button style={navButtonStyle}>🦴 My Pack</button>
            <button style={navButtonStyle}>📍 Nearby Dogs</button>
            <button onClick={() => supabase.auth.signOut()} style={{ ...navButtonStyle, color: '#e74c3c' }}>Logout</button>
          </nav>
        </div>
      </aside>

      {/* --- CENTER FEED (SCROLLABLE) --- */}
      <main style={{ padding: '20px' }}>
        
        {/* 1. MY PACK STORIES */}
        <section style={{ marginBottom: '25px' }}>
          <h3 style={sectionHeaderStyle}>My Pack</h3>
          <div style={storyScrollContainer}>
            <div style={addStoryCard} onClick={() => setIsAddDogOpen(true)}>+</div>
            {myPack.map(dog => (
              <div key={dog.id} style={storyCard}>
                <img src={dog.main_image_url || 'https://via.placeholder.com/60'} style={storyAvatarStyle} />
                <span style={storyNameStyle}>{dog.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. ACTION BUTTONS */}
        <div style={actionRowStyle}>
          <button onClick={() => setIsAddDogOpen(true)} style={primaryActionBtn}>➕ Report Sighting</button>
          <button onClick={() => setIsActivityOpen(true)} style={secondaryActionBtn}>📝 Log Activity</button>
        </div>

        {/* 3. ACTIVITY FEED */}
        <section>
          <h3 style={sectionHeaderStyle}>Community Activity</h3>
          {dogs.map(dog => (
            <div key={dog.id} style={feedCardStyle}>
              <div style={cardHeaderStyle}>
                <div style={avatarSmallStyle}></div>
                <div>
                  <strong>{dog.name}</strong>
                  <p style={cardMetaStyle}>Sighted near {dog.landmark_note || 'Vizag'}</p>
                </div>
              </div>
              {dog.main_image_url && <img src={dog.main_image_url} style={cardImgStyle} />}
              <div style={{ padding: '15px' }}>
                <p style={{ margin: 0 }}>{dog.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* --- RIGHT SIDEBAR (STICKY) --- */}
      <aside style={rightSidebarStyle}>
        <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* MINI MAP */}
          <div style={miniMapContainerStyle}>
            <MapContainer center={[17.7665, 83.3590]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {dogs.map(dog => dog.last_location_lat && (
                <Marker key={dog.id} position={[dog.last_location_lat, dog.last_location_long]} />
              ))}
            </MapContainer>
          </div>

          {/* RADIUS FILTER */}
          <div style={cardStyle}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Radius: {radius} km</p>
            <input 
              type="range" min="1" max="20" value={radius} 
              onChange={(e) => setRadius(e.target.value)} 
              style={{ width: '100%' }} 
            />
          </div>

          {/* NEARBY DOGS LIST */}
          <div style={cardStyle}>
            <h4 style={{ margin: '0 0 10px 0' }}>Nearby Legends</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dogs.slice(0, 3).map(dog => (
                <div key={dog.id} style={nearbyItemStyle}>
                  <img src={dog.main_image_url} style={avatarSmallStyle} />
                  <span>{dog.name}</span>
                </div>
              ))}
              <button style={textButtonStyle}>See all nearby dogs →</button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- ADD DOG MODAL --- */}
      {isAddDogOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>New Sighting</h2>
              <button onClick={() => setIsAddDogOpen(false)} style={closeBtnStyle}>✕</button>
            </div>
            <form onSubmit={addDog} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Dog's Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} required />
              <textarea placeholder="Description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ ...inputStyle, height: '80px' }} />
              <input type="file" name="dogImage" accept="image/*" />
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer center={[17.6868, 83.2185]} zoom={13} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setAddress={setAddress} />
                </MapContainer>
              </div>
              <button type="submit" disabled={uploading} style={submitButtonStyle}>
                {uploading ? 'Uploading...' : 'Confirm Sighting'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ACTIVITY MODAL (Placeholder) --- */}
      {isActivityOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Log Activity</h2>
              <button onClick={() => setIsActivityOpen(false)} style={closeBtnStyle}>✕</button>
            </div>
            <input type="text" placeholder="Search for a dog in your pack..." style={inputStyle} />
            <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
              Search logic coming soon...
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

// --- STYLES (The "Vibe" Layer) ---
const layoutGridStyle = {
  display: 'grid',
  gridTemplateColumns: '280px 1fr 340px',
  minHeight: '100vh',
  background: '#f0f2f5',
  fontFamily: 'system-ui, -apple-system, sans-serif'
}

const sidebarStyle = { background: '#fff', padding: '20px', borderRight: '1px solid #ddd' }
const rightSidebarStyle = { background: '#f0f2f5', padding: '20px', borderLeft: '1px solid #ddd' }

const profileCardStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '12px' }
const avatarLargeStyle = { width: '45px', height: '45px', borderRadius: '50%', background: '#ddd' }
const avatarSmallStyle = { width: '35px', height: '35px', borderRadius: '50%', background: '#ddd', objectFit: 'cover' }

const navButtonStyle = { width: '100%', padding: '12px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '1rem' }

const sectionHeaderStyle = { fontSize: '1.1rem', color: '#444', marginBottom: '15px' }

const storyScrollContainer = { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }
const storyCard = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '70px' }
const addStoryCard = { ...storyCard, width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#999', cursor: 'pointer' }
const storyAvatarStyle = { width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #1877f2', padding: '2px', objectFit: 'cover' }
const storyNameStyle = { fontSize: '0.75rem', fontWeight: '500' }

const actionRowStyle = { display: 'flex', gap: '15px', marginBottom: '30px' }
const primaryActionBtn = { flex: 1, padding: '15px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }
const secondaryActionBtn = { flex: 1, padding: '15px', background: '#fff', color: '#1877f2', border: '1px solid #1877f2', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }

const feedCardStyle = { background: '#fff', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }
const cardHeaderStyle = { padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '12px' }
const cardImgStyle = { width: '100%', maxHeight: '450px', objectFit: 'cover' }
const cardMetaStyle = { margin: 0, fontSize: '0.8rem', color: '#65676b' }

const miniMapContainerStyle = { height: '220px', borderRadius: '15px', overflow: 'hidden', border: '1px solid #ddd' }
const cardStyle = { background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }
const nearbyItemStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '500' }
const textButtonStyle = { background: 'none', border: 'none', color: '#1877f2', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
const modalContentStyle = { background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }
const submitButtonStyle = { width: '100%', padding: '12px', background: '#1877f2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
const closeBtnStyle = { border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }

export default App