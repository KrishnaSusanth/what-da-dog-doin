import { useState, useEffect } from 'react'
import { getDogsByUser, deleteDog } from '../services/dogService'
import EditDogModal from './modals/EditDogModal'
import ActivityLogModal from './modals/ActivityLogModal'

export default function UserProfile({ user, profile, onClose }) {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingDog, setEditingDog] = useState(null)
  const [activityDog, setActivityDog] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchUserDogs()
    }
  }, [user])

  const fetchUserDogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const userDogs = await getDogsByUser(user.id)
      setDogs(userDogs)
    } catch (err) {
      console.error('Error fetching dogs:', err)
      setError('Failed to load your dogs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDog = async (dogId) => {
    setLoading(true)
    try {
      await deleteDog(dogId)
      setDogs(dogs.filter(d => d.id !== dogId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting dog:', err)
      setError('Failed to delete dog')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto'
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  }

  const profileHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  }

  const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#ddd'
  }

  const profileInfoStyle = {
    flex: 1
  }

  const dogCardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }

  const dogImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '15px'
  }

  const dogDetailsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '15px',
    fontSize: '14px'
  }

  const actionButtonsStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  }

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  }

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white'
  }

  const logButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white'
  }

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white'
  }

  const emptyStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666'
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>My Profile</h1>
        <button onClick={onClose} style={closeButtonStyle}>
          ← Back
        </button>
      </div>

      {/* Profile Header */}
      <div style={profileHeaderStyle}>
        {profile?.avatar_url && (
          <img src={profile.avatar_url} alt="Profile" style={avatarStyle} />
        )}
        <div style={profileInfoStyle}>
          <h2>{profile?.display_name || 'User'}</h2>
          <p style={{ color: '#666', margin: '5px 0' }}>
            @{profile?.username}
          </p>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Karma Points: <strong>{profile?.karma_points || 0}</strong>
          </p>
          {profile?.date_of_birth && (
            <p style={{ color: '#666', margin: '5px 0' }}>
              DOB: {new Date(profile.date_of_birth).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: '#d32f2f', marginBottom: '20px', padding: '15px', background: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <h2 style={{ marginBottom: '20px' }}>
        My Dogs ({dogs.length})
      </h2>

      {loading ? (
        <div style={emptyStyle}>Loading...</div>
      ) : dogs.length === 0 ? (
        <div style={emptyStyle}>
          <p>You haven't added any dogs yet.</p>
        </div>
      ) : (
        <div>
          {dogs.map(dog => (
            <div key={dog.id} style={dogCardStyle}>
              {dog.main_image_url && (
                <img src={dog.main_image_url} alt={dog.name} style={dogImageStyle} />
              )}

              <h3 style={{ margin: '0 0 10px 0' }}>
                {dog.name}
                {dog.status && (
                  <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                    ({dog.status})
                  </span>
                )}
              </h3>

              {dog.description && (
                <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                  {dog.description}
                </p>
              )}

              <div style={dogDetailsStyle}>
                {dog.gender && (
                  <div>
                    <strong>Gender:</strong> {dog.gender}
                  </div>
                )}
                {dog.color && (
                  <div>
                    <strong>Color:</strong> {dog.color}
                  </div>
                )}
                {dog.health_status && (
                  <div>
                    <strong>Health:</strong> {dog.health_status}
                  </div>
                )}
                {dog.is_vaccinated && (
                  <div>
                    <strong>✓ Vaccinated</strong>
                  </div>
                )}
                {dog.is_neutered && (
                  <div>
                    <strong>✓ Neutered</strong>
                  </div>
                )}
                {dog.friendliness_level && (
                  <div>
                    <strong>Friendliness:</strong> {dog.friendliness_level}/5
                  </div>
                )}
              </div>

              <div style={actionButtonsStyle}>
                <button
                  onClick={() => setEditingDog(dog)}
                  style={editButtonStyle}
                >
                  ✎ Edit
                </button>
                <button
                  onClick={() => setActivityDog(dog)}
                  style={logButtonStyle}
                >
                  📝 Log Activity
                </button>
                <button
                  onClick={() => setDeleteConfirm(dog.id)}
                  style={deleteButtonStyle}
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === dog.id && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                  <p>Are you sure you want to delete "{dog.name}"?</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDeleteDog(dog.id)}
                      style={{ ...deleteButtonStyle, padding: '6px 12px', fontSize: '13px' }}
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{ ...closeButtonStyle, padding: '6px 12px', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {editingDog && (
        <EditDogModal
          dog={editingDog}
          onClose={() => setEditingDog(null)}
          onSave={fetchUserDogs}
        />
      )}

      {activityDog && (
        <ActivityLogModal
          dog={activityDog}
          userId={user.id}
          onClose={() => setActivityDog(null)}
          onActivityLogged={fetchUserDogs}
        />
      )}
    </div>
  )
}
