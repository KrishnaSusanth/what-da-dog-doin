import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for userId:', userId)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error)
          throw error
        }

        console.log('Profile fetched:', data)
        setProfile(data || null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setProfile(null)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  return { profile, loading }
}
