import { Marker, useMapEvents } from 'react-leaflet'

export default function LocationPicker({ lat, lng, setLat, setLng, setAddress }) {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat)
      setLng(e.latlng.lng)

      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => setAddress(data.display_name || "Address not found"))
        .catch(console.error)
    },
  })

  return <Marker position={[lat, lng]} />
}