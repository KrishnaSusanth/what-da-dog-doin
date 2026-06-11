# 🐛 Debugging Guide - Avatar Upload & Map Issues

## Testing Avatar Upload

### Step 1: Open Browser DevTools
1. Press `F12` or `Cmd+Opt+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Go to **Console** tab
3. Keep this open while signing up

### Step 2: Sign Up and Upload Profile Picture
1. Fill in all signup fields
2. On Step 3, select a profile picture
3. Watch the console for logs starting with ✅ or ❌

### Expected Console Output

**If upload succeeds:**
```
Starting avatar upload for user: [user-id]
File: photo.jpg Size: 245678 Type: image/jpeg
Available buckets: ['dog-photos', 'avatars']
✅ File uploaded successfully to: profiles/[user-id]_[timestamp]_photo.jpg
✅ Public avatar URL: https://[project].supabase.co/storage/v1/object/public/avatars/...
```

**If upload fails - check for errors:**
- ❌ Avatar upload error: [error message]
- Check if `avatars` bucket is in the available buckets list
- Check RLS policies on avatars bucket

---

## Checking Supabase Setup

### In Supabase Dashboard:

1. **Storage > Buckets:**
   - ✅ `avatars` bucket exists
   - ✅ `dog-photos` bucket exists
   - Both should be **Public** (not Private)

2. **avatars bucket > Policies:**
   - At least one SELECT policy for public read
   - One INSERT or ALL policy for uploads

3. **avatars bucket > Objects:**
   - Should see files like: `profiles/[user-id]_[timestamp]_photo.jpg`

---

## Testing Map & Dogs Display

### In Console:
After logging in, check these logs:

```
MapPanel rendering with profile: {interest_center_lat: 17.xxx, ...}
Center: 17.xxx 83.xxx Radius: 2
Dogs: 5  (should show number of dogs in your area)

useDogs: Loading dogs with profile: {interest_center_lat: 17.xxx, ...}
useDogs: Fetched 5 nearby dogs
```

### If Map Not Working:
- Profile should show your interest location
- Circle should appear on map
- Dogs should show as pins inside the circle

### If No Dogs Show:
- Might be because no dogs exist in your area yet
- Add a dog sighting in that area first
- Check server logs for distance calculation errors

---

## Quick Fixes to Try

### 1. Avatar Still Not Uploading?
- Ensure `avatars` bucket is **Public**, not Private
- Check RLS policies: SELECT should be checked for public access
- Refresh page after bucket changes
- Try signing up again

### 2. Map Not Centered?
- Wait 2-3 seconds after login (data might be loading)
- Check console for any errors related to profile loading
- Clear browser cache: Cmd+Shift+Delete (Chrome)

### 3. No Dogs Showing?
- Make sure you have dogs in your area (add one first)
- Check browser console for distance calculation logs
- Check if `fetchDogsNearUser` is being called

---

## Browser Console Commands

Paste these in browser console to debug:

```javascript
// Check if profile loaded
console.log('Profile:', JSON.stringify(localStorage.profile, null, 2))

// Check if dogs loaded
console.log('Dogs in map area', window.dogsData)
```

---

## Still Having Issues?

1. Share the console errors from signup (screenshot of ❌ error messages)
2. Check Supabase Storage > avatars > Objects - are files appearing there?
3. Verify avatars bucket is Public, not Private
4. Try a different image file (in case file format issue)

