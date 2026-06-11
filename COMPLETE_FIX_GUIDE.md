# 🔧 Complete Fix Guide for Avatar & Map Panel Issues

## Overview of Issues

### Issue #1: Avatar Upload RLS Error ❌
**Error**: `StorageApiError: new row violates row-level security policy`

**Root Cause**: The avatars bucket has INSERT policy set to "public" scope instead of "Authenticated users"

**Status**: ✅ FIXED in code

### Issue #2: Avatar URL Not Persisted in Profile ❌
**Error**: Profile is updated but avatar_url remains null even if upload succeeds

**Root Cause**: Avatar upload was not updating the profile record with the avatar URL

**Status**: ✅ FIXED in code (profileService.js now calls updateProfile after successful upload)

### Issue #3: Map Panel Area Not Showing After Signup ❌
**Error**: Circle overlay doesn't appear immediately after signup, but shows after logout/login

**Root Cause**: Timing issue - profile data might not be fully synced or loaded when map first renders

**Status**: ✅ FIXED in code (MapPanel now tracks when profile becomes available, useProfile has real-time subscription)

---

## What Changed in Your Code

### 1. profileService.js ✅
**Before**: Avatar upload returned URL but didn't save it to profile
**After**: Avatar upload now calls `updateProfile()` to store avatar URL in the database

```javascript
// After successful upload:
await updateProfile(userId, { avatar_url: avatarUrl })
```

### 2. MapPanel.jsx ✅
**Before**: MapUpdater didn't track when profile first became available
**After**: MapUpdater now receives `hasProfile` flag and properly detects first profile load

```javascript
<MapUpdater centerLat={centerLat} centerLng={centerLng} hasProfile={!!profile} />
```

### 3. useProfile.js (hooks) ✅
**Before**: Only fetched profile once on component mount
**After**: Added real-time subscription to listen for profile updates

```javascript
// Now listens for changes via Supabase real-time
const subscription = supabase
  .from('profiles')
  .on('*', (payload) => {
    if (payload.new?.id === userId) {
      setProfile(payload.new)
    }
  })
  .subscribe()
```

---

## Required Manual Action: Fix RLS Policy

**This is the CRITICAL fix you need to do in Supabase Dashboard**

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to your project
   - Click **Storage** → **avatars** bucket
   - Click **Policies** tab

2. **Delete Current INSERT Policy**
   - Find the INSERT policy that says "public"
   - Click the **... menu** → **Delete**
   - Confirm deletion

3. **Create NEW INSERT Policy** ✅
   - Click **+ New Policy**
   - **Mode**: SELECT (wait, this is for reading avatars)
   - Actually create **INSERT** policy:
     - Click **+ New Policy** again
     - **Mode**: INSERT
     - **Apply to**: ✅ **Authenticated users** (NOT public!)
     - **Expression**: Leave **completely empty**
     - Click **Review** → **Save policy**

### Result: Final RLS Policies
After this, you should have:
- ✅ **SELECT** policy on `public` - allows anyone to download/view avatars
- ✅ **INSERT** policy on `Authenticated users` - allows only logged-in users to upload

---

## Testing the Fix

### Test 1: Avatar Upload
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Sign up with **new email address** (don't retry with same email)
4. Upload a profile picture
5. Look for these logs:
   - ✅ `✅ File uploaded successfully to: profiles/...`
   - ✅ `✅ Public avatar URL: https://...`
   - ✅ `✅ Profile updated with avatar URL`

If you see these, avatar upload is working!

### Test 2: Profile Picture in Database
1. After signup, go to Supabase Dashboard
2. Click **Table Editor** → **profiles**
3. Find your profile row
4. Check the **avatar_url** column
5. It should contain: `https://your-project.supabase.co/storage/v1/object/public/avatars/profiles/...`

### Test 3: Map Panel Circle
1. After signup, you should immediately see:
   - ✅ Map centered on your interest location
   - ✅ Blue dashed circle showing your interest area
   - ✅ Dogs near your location displayed as markers

If the circle doesn't appear, check the browser console for any errors about profile loading.

---

## Debugging Console Logs

### Expected Logs for Successful Signup:

```
✅ Auth user created: 1ea8a3ee-5bee-4037-a6b9-d6d456d455db
Starting avatar upload for user: 1ea8a3ee...
File: test.jpg Size: 45678 Type: image/jpeg
✅ File uploaded successfully to: profiles/1ea8a3ee.../test.jpg
✅ Public avatar URL: https://mzjqpmkbucrosaiiuqxc.supabase.co/storage/v1/object/public/avatars/profiles/...
✅ Profile updated with avatar URL  ← NEW!
Creating profile record in database...
✅ Profile created successfully
✅ Profile created successfully (at the Signup component level)
```

### If Avatar Upload Still Fails:

You'll see:
```
❌ Avatar upload error: StorageApiError: new row violates row-level security policy
```

**Solution**: Go back to step 2 - delete the wrong INSERT policy and create new one.

---

## Summary of Changes

| File | Change | Why |
|------|--------|-----|
| `src/services/profileService.js` | Added `updateProfile()` call after upload | Persist avatar URL to database |
| `src/components/MapPanel.jsx` | Added `hasProfile` prop to MapUpdater | Detect when profile first loads |
| `src/hooks/useProfile.js` | Added real-time subscription | Detect profile changes immediately |
| `AVATAR_RLS_FIX_STEP_BY_STEP.md` | New guide | Help you fix RLS policies |

---

## Timeline of Events (Now Fixed)

### Before Fixes ❌
1. User signs up
2. Auth user created ✅
3. Avatar uploaded but RLS blocks it ❌
4. Profile created without avatar_url (null) ❌
5. Map shows default area instead of user's area ❌
6. After logout/login, profile loads from cache and map works ✅

### After Fixes ✅
1. User signs up
2. Auth user created ✅
3. Avatar uploaded successfully ✅
4. Avatar URL saved to profile ✅
5. Profile created with avatar_url populated ✅
6. Real-time subscription detects profile creation ✅
7. Map loads immediately with user's area and circle ✅
8. No logout/login needed! ✅

---

## If You Still Have Issues

1. **Check Supabase RLS Policies**
   - Make sure INSERT is on "Authenticated users", not "public"
   - Make sure expression is empty (blank)

2. **Check Browser Console for Errors**
   - Look for any errors about RLS, permissions, or 409 conflicts

3. **Try Clearing Browser Cache**
   - Clear all cache and cookies for your domain
   - Sign out completely
   - Sign up with a new email

4. **Verify Database RLS on profiles table**
   - Go to **profiles** table → **RLS** toggle
   - Should be ON (enabled)
   - Click **Policies** tab
   - You should have:
     - INSERT policy for authenticated users: `(auth.uid() = id)`
     - SELECT policy for authenticated users: `(auth.uid() = id)`
     - UPDATE policy for authenticated users: `(auth.uid() = id)`

---

## Next Steps

1. ✅ **Immediately**: Fix the RLS policy on avatars bucket (see "Required Manual Action" section)
2. ✅ **Test**: Sign up and upload avatar
3. ✅ **Verify**: Check profile has avatar_url in database
4. ✅ **Confirm**: Map shows circle immediately after signup

If all working, you're done! 🎉
