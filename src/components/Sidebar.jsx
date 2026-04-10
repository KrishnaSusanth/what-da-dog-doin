import { supabase } from '../supabaseClient'

export default function Sidebar({ user }) {
  return (
    <aside style={sidebarStyle}>
      <div style={{ position: 'sticky', top: '20px' }}>
        
        <h2 style={{ color: '#1877f2' }}>🐾 WD Doin?</h2>

        <div style={profileCardStyle}>
          <div style={avatarLargeStyle}></div>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              {user.email.split('@')[0]}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              ✨ 45 Karma
            </p>
          </div>
        </div>

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

const profileCardStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px'
}

const avatarLargeStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  background: '#ddd'
}

const logoutBtn = {
  marginTop: '20px',
  color: 'red'
}