import { useEffect, useState } from 'react'
import { fetchDogs, createDog } from '../services/dogService'

export function useDogs(session) {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadDogs() {
    const data = await fetchDogs()
    setDogs(data)
  }

  useEffect(() => {
    if (session) loadDogs()
  }, [session])

  async function addDog(data) {
    setLoading(true)
    await createDog(data)
    await loadDogs()
    setLoading(false)
  }

  return { dogs, addDog, loading }
}