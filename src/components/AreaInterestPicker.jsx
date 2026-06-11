import { Marker, Circle, useMapEvents } from 'react-leaflet'

export default function AreaInterestPicker({ lat, lng, radius, setLat, setLng, setAreaName }) {
  useMapEvents({
    click(e) {
      const clickedLat = e.latlng.lat
      const clickedLng = e.latlng.lng

      setLat(clickedLat)
      setLng(clickedLng)

      // Reverse geocoding to get area name - use jsonv2 format
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${clickedLat}&lon=${clickedLng}`, {
        headers: {
          'User-Agent': 'WhatDaDogDoinApp/1.0 (contact@example.com)'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Geocoding API error')
          return res.json()
        })
        .then(data => {
          console.log('Geocoding response:', data)
          
          // Build cleaner address like LocationPicker
          let areaName = 'Unknown Location'
          
          if (data.address) {
            const road = data.address.road || ''
            const suburb = data.address.suburb || data.address.neighbourhood || ''
            const city = data.address.city || data.address.town || data.address.village || ''
            
            const cleanAddress = [road, suburb, city].filter(Boolean).join(', ')
            areaName = cleanAddress || data.display_name || 'Unknown Location'
          } else if (data.display_name) {
            areaName = data.display_name
          }
          
          console.log('Setting area name to:', areaName)
          setAreaName(areaName)
        })
        .catch(err => {
          console.error('Geocoding failed:', err)
          const fallbackName = `${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)}`
          console.log('Using fallback:', fallbackName)
          setAreaName(fallbackName)
        })
    },
  })

  if (!lat || !lng) return null

  return (
    <>
      <Circle
        center={[lat, lng]}
        radius={radius * 1000} // Convert km to meters
        pathOptions={{
          color: '#1877f2',
          fillColor: '#1877f2',
          fillOpacity: 0.2,
          weight: 2
        }}
      />
      <Marker position={[lat, lng]} />
    </>
  )
}
