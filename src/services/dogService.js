import { supabase } from '../supabaseClient'

export async function fetchDogs() {
  const { data, error } = await supabase
    .from('stray_dogs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data || []
}

export async function fetchDogsNearUser(lat, lng, radiusKm) {
  // Fetch all dogs and filter by distance (Supabase doesn't have great geographic queries without PostGIS)
  const { data, error } = await supabase
    .from('stray_dogs')
    .select('*')
    .not('last_location_lat', 'is', null)
    .not('last_location_long', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error

  // Filter by distance on client side
  return (data || []).filter(dog => {
    const distance = calculateDistance(
      lat, lng,
      dog.last_location_lat, dog.last_location_long
    )
    return distance <= radiusKm
  })
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fixed: Now accurately captures all incoming properties packed by your modal form data payload
export async function createDog(dogData) {
  const {
    name,
    description,
    file,
    userId,
    lat,
    lng,
    gender,
    color,
    health_status,
    is_neutered,
    is_vaccinated,
    friendliness_level
  } = dogData

  let publicUrl = ''

  if (file) {
    try {
      const fileName = `${Date.now()}_${file.name}`
      
      // Note: Ensure a bucket named 'dog-photos' exists in your Supabase storage!
      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(fileName)

      publicUrl = data.publicUrl
    } catch (uploadErr) {
      console.error('⚠️ Sighting photo upload failed, skipping picture mapping:', uploadErr.message)
    }
  }

  // Maps UI variables directly to database tables matching your public.stray_dogs schema layout
  const { error } = await supabase
    .from('stray_dogs')
    .insert([
      {
        name,
        description,
        main_image_url: publicUrl,
        created_by: userId,
        last_location_lat: lat,
        last_location_long: lng,
        status: health_status === 'Healthy' ? 'healthy' : 'needs_attention',
        gender: gender || 'Unknown',
        color: color || null,
        health_status: health_status || 'Healthy',
        is_neutered: !!is_neutered,
        is_vaccinated: !!is_vaccinated,
        friendliness_level: friendliness_level || 3
      }
    ])

  if (error) {
    console.error('❌ Supabase database insert failed:', error)
    throw error
  }
}

export async function getDogsByUser(userId) {
  console.log('🐕 Fetching dogs created by user:', userId)

  const { data, error } = await supabase
    .from('stray_dogs')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching user dogs:', error)
    throw error
  }

  console.log('✅ Found', data?.length || 0, 'dogs')
  return data || []
}

export async function getDogById(dogId) {
  console.log('🐕 Fetching dog:', dogId)

  const { data, error } = await supabase
    .from('stray_dogs')
    .select('*')
    .eq('id', dogId)
    .single()

  if (error) {
    console.error('❌ Error fetching dog:', error)
    throw error
  }

  return data
}

export async function updateDog(dogId, updates) {
  console.log('✏️ Updating dog:', dogId, updates)

  const { data, error } = await supabase
    .from('stray_dogs')
    .update(updates)
    .eq('id', dogId)

  if (error) {
    console.error('❌ Error updating dog:', error)
    throw error
  }

  console.log('✅ Dog updated')
  return data
}

export async function deleteDog(dogId) {
  console.log('🗑️ Deleting dog:', dogId)

  const { error } = await supabase
    .from('stray_dogs')
    .delete()
    .eq('id', dogId)

  if (error) {
    console.error('❌ Error deleting dog:', error)
    throw error
  }

  console.log('✅ Dog deleted')
}