import { supabase } from '../supabaseClient'

export default function Sidebar({ user, profile, onProfileClick }) {
  // Easiest approach: We completely removed useProfile here!
  // It now uses the live, shared 'profile' prop passed from App.jsx

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url
  const karma = profile?.karma_points || 0

  return (
    <aside style={sidebarStyle}>
      <div style={{ position: 'sticky', top: '20px' }}>
        
        <h2 style={{ color: '#1877f2' }}>🐾 WD Doin?</h2>

        <button
          onClick={onProfileClick}
          style={profileCardButtonStyle}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              style={avatarLargeStyle}
              alt={displayName}
            />
          ) : (
            <div style={avatarLargeStyle}></div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', textAlign: 'left' }}>
              {displayName}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', textAlign: 'left' }}>
              ✨ {karma} Karma
            </p>
          </div>
        </button>

        <button onClick={() => supabase.auth.signOut()} style={logoutBtn}>
          Logout
        </button>

      </div>
    </aside>
  )
}

const sidebarStyle = {
  background: '#fff',
  padding: '20px',
  borderRight: '1px solid #ddd'
}

const profileCardButtonStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  background: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s',
  width: '100%',
  boxSizing: 'border-box'
}

const avatarLargeStyle = {
  width: '50px', 
  height: '50px',
  borderRadius: '50%',
  background: '#ddd',
  objectFit: 'cover'
}

const logoutBtn = {
  marginTop: '20px',
  color: 'red',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline'
}