# 🔐 RLS Policy Setup Guide

## Problem
The profiles table and avatars bucket RLS policies are blocking access. This prevents profile creation and avatar uploads.

---

## Fix 1: Setup Policies on `profiles` Table

### Step 1: Go to Supabase Dashboard
1. Select your project
2. Click **Authentication** → **Policies** (in left sidebar)
3. Find and click on **profiles** table

### Step 2: Create SELECT Policy (Users read their own profile)
1. Click **+ Create Policy** → **For SELECT**
2. Name: `Users can select their own profile`
3. **IMPORTANT**: Set **Apply to** to **Public** (everyone should read)
4. Expression USING: `(auth.uid() = id)`
5. Click **Review** → **Save**

### Step 3: Create INSERT Policy (New users create their profile)
1. Click **+ Create Policy** → **For INSERT**
2. Name: `Users can insert their own profile`
3. **IMPORTANT**: Set **Apply to** to **Authenticated users** (NOT public!)
4. Expression USING: `(auth.uid() = id)`
5. Expression WITH CHECK: `(auth.uid() = id)`
6. Click **Review** → **Save**

### Step 4: Create UPDATE Policy (Users update their own profile)
1. Click **+ Create Policy** → **For UPDATE**
2. Name: `Users can update their own profile`
3. **IMPORTANT**: Set **Apply to** to **Authenticated users** (NOT public!)
4. Expression USING: `(auth.uid() = id)`
5. Expression WITH CHECK: `(auth.uid() = id)`
6. Click **Review** → **Save**

---

## Fix 2: Setup Policies on `avatars` Storage Bucket

### Step 1: Go to Storage
1. Click **Storage** in sidebar
2. Click on **avatars** bucket
3. Click **Policies** tab

### Step 2: Delete Old Policies (if any)
- If you have policies that don't work, delete them first
- Click the trash icon next to the policy

### Step 3: Create SELECT Policy (Public read access)
1. Click **+ Create Policy**
2. **Mode**: SELECT
3. **Apply to**: All users
4. **Expression**: Leave blank (means everyone can read)
5. Click **Review** → **Save**

### Step 4: Create INSERT Policy (Authenticated users upload)
1. Click **+ Create Policy**
2. **Mode**: INSERT
3. **Apply to**: Authenticated users
4. **Expression**: `(auth.uid()::text = (storage.foldername(name))[1])`
   - This ensures users only upload to their own folder
5. Click **Review** → **Save**

### Alternative (More Permissive - For Testing Only)
If the above doesn't work, use this simpler policy:
- **Mode**: INSERT
- **Apply to**: Authenticated users
- **Expression**: Leave blank
- This allows all authenticated users to upload anywhere

---

## Fix 3: Verify Policies Are Working

### Test SELECT on profiles:
In browser console:
```javascript
const supabase = window.supabase
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'YOUR_USER_ID')
  .single()

console.log('Data:', data)
console.log('Error:', error)
```

If you get an error, the SELECT policy isn't working.

### Test INSERT into profiles:
```javascript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: 'YOUR_USER_ID',
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser'
  })

console.log('Data:', data)
console.log('Error:', error)
```

---

## Important Notes

### RLS Policies Explained:
- **SELECT** → Controls who can READ data
- **INSERT** → Controls who can CREATE new rows
- **UPDATE** → Controls who can MODIFY existing rows
- **DELETE** → Controls who can REMOVE rows

### Authentication Check:
- `auth.uid()` = Currently logged-in user's ID
- `id` = The user ID column in profiles table
- `(auth.uid() = id)` = User can only access their own row

### Storage Bucket:
- `storage.foldername(name)` extracts folder from path
- For path `profiles/[userid]/file.jpg`, it gets `[userid]`
- Policy ensures user can only upload to their own folder

---

## After Fixing Policies

1. **Sign up again** with a new account
2. **Check browser console** for logs:
   - ✅ Profile should be created
   - ✅ Avatar should upload
3. **Check Supabase Dashboard**:
   - profiles table → should show your user record
   - avatars bucket → should show your profile picture

---

## Still Not Working?

Try these steps:

### Option 1: Completely Open Policies (Testing Only)
For testing purposes, you can temporarily make policies very permissive:

**For profiles table:**
1. SELECT policy → `(true)` (everyone can read)
2. INSERT policy → `(true)` (everyone can write)

**For avatars bucket:**
1. SELECT policy → Leave blank (public read)
2. INSERT policy → Leave blank (everyone can write)

⚠️ **Warning**: This is NOT secure for production! Use only for testing.

### Option 2: Check Policy Status
1. Go to profiles table
2. Look at the **RLS** toggle at top right
3. Make sure it says **RLS is ON**
4. Check that policies are listed below

### Option 3: Clear Cache & Retry
1. Refresh browser: Cmd+R or Ctrl+R
2. Sign up with new email
3. Check console logs again

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 406 | Policy missing or wrong | Add/fix SELECT policy |
| 403 | Not authenticated or wrong policy | Check INSERT policy, ensure user is logged in |
| "violates row-level security" | Policy expression wrong | Use `(auth.uid() = id)` for storage |
| null profile returned | INSERT failed silently | Check policies on profiles table |

