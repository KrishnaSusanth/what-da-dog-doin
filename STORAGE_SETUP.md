# 🔧 Setup Guide for Storage Buckets

## Create "avatars" Bucket in Supabase

Follow these steps to create the storage bucket for profile pictures:

### Step 1: Go to Supabase Dashboard
- Visit: https://app.supabase.com
- Select your project

### Step 2: Navigate to Storage
- Click on **Storage** in the left sidebar
- Click **+ Create a new bucket**

### Step 3: Create "avatars" Bucket
- **Bucket name:** `avatars`
- **Make it public:** ✅ Check "Public bucket"
- Click **Create bucket**

### Step 4: Set Bucket Permissions (RLS Policy)
- Click on the **avatars** bucket
- Go to **Policies** tab
- Click **+ New Policy** (if no policies exist) or **+ Create Policy**
- Select **For SELECT** (for reading/viewing images publicly)
  - Add policy: Allow all users to select (read) from this bucket
  - Click **Review** → **Save**

### Step 5: Upload Permissions (Optional)
If you want authenticated users to upload their own pictures:
- Click **+ Create Policy** → **For INSERT**
  - Add policy: Allow authenticated users to insert into this bucket
  - Click **Review** → **Save**

---

## Verify Setup

After creating the bucket, test by uploading a profile picture during signup. You should see:
1. ✅ No errors in console
2. ✅ Profile picture displayed in sidebar after login
3. ✅ Images visible in Supabase Storage → avatars bucket

---

## If You See "avatars bucket does not exist" Error

Make sure:
1. Bucket is created and named exactly: `avatars`
2. Bucket is set to **Public** (not private)
3. You have storage RLS policies configured
4. Clear browser cache and retry signup

---

## Notes

- The same bucket setup applies to `dog-photos` if it doesn't exist
- Public buckets are safe for images since they're just read-only URLs
- Auth users can have restricted upload permissions via RLS policies
