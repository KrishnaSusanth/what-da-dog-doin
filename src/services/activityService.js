import { supabase } from '../supabaseClient'

export async function logActivity(userId, dogId, actionType, notes = '', imageUrl = null) {
  console.log('📝 Logging activity:', { dogId, actionType, notes })

  const { data, error } = await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      dog_id: dogId,
      action_type: actionType,
      notes,
      image_url: imageUrl
    }])

  if (error) {
    console.error('❌ Activity log error:', error)
    throw error
  }

  console.log('✅ Activity logged:', data)
  return data
}

export async function getActivitiesForDog(dogId) {
  console.log('📖 Fetching activities for dog:', dogId)

  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id,
      created_at,
      action_type,
      notes,
      image_url,
      user_id,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching activities:', error)
    throw error
  }

  console.log('✅ Activities fetched:', data?.length)
  return data || []
}

export async function getUserActivities(userId) {
  console.log('📊 Fetching activities by user:', userId)

  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id,
      created_at,
      action_type,
      notes,
      image_url,
      stray_dogs (
        id,
        name,
        main_image_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching user activities:', error)
    throw error
  }

  return data || []
}
