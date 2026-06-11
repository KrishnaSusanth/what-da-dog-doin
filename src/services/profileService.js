import { supabase } from '../supabaseClient'

export async function createProfile(userId, profileData) {
  const { first_name, last_name, username, date_of_birth, avatar_url, interest_center_lat, interest_center_long, interest_radius_meters, home_area_id } = profileData

  console.log('Creating profile record in database...')
  console.log('📋 Data to insert:', { first_name, last_name, username, date_of_birth })
  
  const { error } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      first_name,
      last_name,
      username,
      date_of_birth,
      avatar_url,
      interest_center_lat,
      interest_center_long,
      interest_radius_meters,
      home_area_id,
      display_name: `${first_name} ${last_name}`,
      karma_points: 0
    }])

  if (error) {
    console.error('❌ Profile creation error:', error)
    console.error('Error code:', error.code)
    console.error('Error hint:', error.hint)
    console.error('Error details:', error.details)
    
    // Handle duplicate key (profile already exists)
    if (error.code === '23505') {
      console.log('⚠️ Duplicate key detected! A profile for this user already exists.')
      console.log('📋 Attempting UPDATE with same data...')
      
      // Try to update instead
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name,
          last_name,
          username,
          date_of_birth,
          avatar_url,
          interest_center_lat,
          interest_center_long,
          interest_radius_meters,
          home_area_id,
          display_name: `${first_name} ${last_name}`
        })
        .eq('id', userId)
      
      if (updateError) {
        console.error('❌ UPDATE failed:', updateError)
        throw new Error(`Profile update failed: ${updateError.message}`)
      }
      
      console.log('✅ Profile updated successfully with:')
      console.log(`  - first_name: ${first_name}`)
      console.log(`  - last_name: ${last_name}`)
      console.log(`  - username: ${username}`)
      console.log(`  - display_name: ${first_name} ${last_name}`)
      return
    }
    
    if (error.code === '42P01') {
      throw new Error('Profiles table does not exist. Check your database setup.')
    } else if (error.code === '42501') {
      throw new Error('Permission denied on profiles table. Check RLS policies. Make sure INSERT policy is for "Authenticated users", not "public".')
    } else if (error.message?.includes('row-level security')) {
      throw new Error('RLS policy blocked profile creation. Make sure INSERT policy is set to "Authenticated users" and has expression: (auth.uid() = id)')
    }
    
    throw error
  }

  console.log('✅ Profile created successfully')
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
}

export async function checkUsernameAvailable(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (error && error.code === 'PGRST116') {
    // No rows returned = username is available
    return true
  }
  
  if (error) throw error
  return false // Username exists
}

export async function uploadProfilePicture(userId, file) {
  if (!file) return null
  
  const fileName = `profiles/${userId}_${Date.now()}_${file.name}`
  
  console.log('Starting avatar upload for user:', userId)
  console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)

  try {
    // List buckets first to verify 'avatars' exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Available buckets:', buckets?.map(b => b.name))
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('❌ Avatar upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log('✅ File uploaded successfully to:', fileName)

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const avatarUrl = publicUrlData.publicUrl
    console.log('✅ Public avatar URL:', avatarUrl)
    
    // Update profile with avatar URL
    await updateProfile(userId, { avatar_url: avatarUrl })
    console.log('✅ Profile updated with avatar URL')
    
    return avatarUrl
  } catch (err) {
    console.error('❌ Profile picture upload error:', err.message)
    console.log('Signup will continue without avatar')
    // Don't throw - allow signup to continue
    return null
  }
}
