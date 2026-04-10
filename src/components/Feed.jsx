export default function Feed({ dogs }) {
  return (
    <section>
      <h3 style={{ marginBottom: '15px' }}>Community Activity</h3>

      {dogs.map(dog => (
        <div key={dog.id} style={feedCardStyle}>
          
          <div style={cardHeaderStyle}>
            <div style={avatarSmallStyle}></div>
            <strong>{dog.name}</strong>
          </div>

          {dog.main_image_url && (
            <img src={dog.main_image_url} style={cardImgStyle} />
          )}

          <div style={{ padding: '15px' }}>
            <p>{dog.description}</p>
          </div>

        </div>
      ))}
    </section>
  )
}

const feedCardStyle = {
  background: '#fff',
  borderRadius: '12px',
  marginBottom: '20px',
  overflow: 'hidden'
}

const cardHeaderStyle = {
  padding: '12px',
  display: 'flex',
  gap: '10px'
}

const avatarSmallStyle = {
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  background: '#ddd'
}

const cardImgStyle = {
  width: '100%',
  maxHeight: '400px',
  objectFit: 'cover'
}