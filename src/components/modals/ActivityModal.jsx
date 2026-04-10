export default function ActivityModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', top: 0 }}>
      <h2>Log Activity</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )
}