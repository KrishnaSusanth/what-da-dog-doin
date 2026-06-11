import { useEffect, useState } from 'react'
import { fetchDogs, fetchDogsNearUser, createDog } from '../services/dogService'

export function useDogs(user, profile) {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadDogs() {
    setLoading(true)
    try {
      console.log('useDogs: Loading dogs with profile:', profile)
      
      // If user has location preferences in profile, fetch nearby dogs
      if (profile?.interest_center_lat && profile?.interest_center_long) {
        console.log('useDogs: Fetching dogs near user location')
        const data = await fetchDogsNearUser(
          profile.interest_center_lat,
          profile.interest_center_long,
          (profile.interest_radius_meters || 2000) / 1000 // Convert to km
        )
        console.log('useDogs: Fetched', data.length, 'nearby dogs')
        setDogs(data)
      } else {
        // Fallback to all dogs
        console.log('useDogs: No profile location, fetching all dogs')
        const data = await fetchDogs()
        console.log('useDogs: Fetched', data.length, 'all dogs')
        setDogs(data)
      }
    } catch (err) {
      console.error('Error loading dogs:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) loadDogs()
  }, [user?.id, profile?.interest_center_lat, profile?.interest_center_long])

  async function addDog(data) {
    setLoading(true)
    try {
      await createDog(data)
      await loadDogs()
    } catch (err) {
      console.error('Error adding dog:', err)
    }
    setLoading(false)
  }

  return { dogs, addDog, loading }
}