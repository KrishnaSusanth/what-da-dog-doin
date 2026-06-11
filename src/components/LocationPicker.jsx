import { Marker, useMapEvents } from 'react-leaflet'

export default function LocationPicker({ lat, lng, setLat, setLng, setAddress }) {
  useMapEvents({
    click(e) {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;

      setLat(clickedLat);
      setLng(clickedLng);

      // 1. Add the headers object to satisfy Nominatim's usage policy
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${clickedLat}&lon=${clickedLng}`, {
        headers: {
          'User-Agent': 'WhatDaDogDoinApp/1.0 (your-email@example.com)' // Replace with your email or app name
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          // 2. Build a cleaner address (or fallback to display_name)
          if (data.address) {
            const road = data.address.road || '';
            const suburb = data.address.suburb || data.address.neighbourhood || '';
            const city = data.address.city || data.address.town || '';
            
            const cleanAddress = [road, suburb, city].filter(Boolean).join(', ');
            setAddress(cleanAddress || data.display_name || "Unknown Location");
          } else {
            setAddress(data.display_name || "Address not found");
          }
        })
        .catch(err => {
          console.error("Geocoding failed: ", err);
          setAddress("Failed to fetch address. Please try again.");
        });
    },
  })

  // Guard clause to prevent rendering a marker at undefined coordinates
  if (!lat || !lng) return null;

  return <Marker position={[lat, lng]} />
}