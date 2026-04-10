import { supabase } from '../supabaseClient'

export async function fetchDogs() {
  const { data, error } = await supabase
    .from('stray_dogs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createDog({ name, description, file, userId, lat, lng }) {
  let publicUrl = ''

  if (file) {
    const fileName = `${Date.now()}_${file.name}`
    await supabase.storage.from('dog-photos').upload(fileName, file)

    const { data } = supabase.storage
      .from('dog-photos')
      .getPublicUrl(fileName)

    publicUrl = data.publicUrl
  }

  const { error } = await supabase.from('stray_dogs').insert([{
    name,
    description,
    main_image_url: publicUrl,
    created_by: userId,
    last_location_lat: lat,
    last_location_long: lng
  }])

  if (error) throw error
}