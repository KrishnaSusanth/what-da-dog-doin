# ✅ Avatar RLS Policy Fix - Step by Step

## The Problem
Your `avatars` bucket has INSERT policy set to **public** instead of **Authenticated users**, causing:
```
StorageApiError: new row violates row-level security policy
```

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
- Go to your Supabase project
- Click **Storage** in left sidebar
- Click on **avatars** bucket
- Click **Policies** tab

### Step 2: View Current Policies
You should see:
- ✅ SELECT policy on `public` scope
- ❌ INSERT policy on `public` scope (THIS IS THE PROBLEM)

### Step 3: Delete the Wrong INSERT Policy
1. Click the **... menu** next to the INSERT policy
2. Click **Delete**
3. Confirm deletion

### Step 4: Create New INSERT Policy
1. Click **+ New Policy**
2. Select **INSERT**
3. Choose **Authenticated users** (NOT public)
4. Leave the expression field **completely empty**
5. Click **Review** → **Save policy**

### Step 5: Verify Your Policies
After this, you should have:
- ✅ SELECT policy applied to `public` (allows anyone to download avatars)
- ✅ INSERT policy applied to `Authenticated users` (allows only logged-in users to upload)

### Step 6: Test
1. Sign up with a new email
2. Upload a profile picture
3. Look in browser console for: `✅ Public avatar URL: https://...`
4. Check if the avatar displays in the profile

---

## If Still Not Working

### Check 1: Verify Policy Applied to Correct Scope
- Policy must say **"Authenticated users"**, not "public"

### Check 2: Verify Expression is Empty
- The expression field should be blank
- Do NOT use folder path expressions like `(storage.foldername(name))[1]`

### Check 3: Download vs Upload
- SELECT policy = downloading/viewing avatars (can be public)
- INSERT policy = uploading avatars (must be authenticated)

---

## Advanced: Policy with Folder Restriction
If you want to restrict uploads to specific folders, use this expression:
```
bucket_id = 'avatars'
```

But for now, leave it blank and test first.

---

## Still Getting Errors?
Check:
1. ✅ Is the policy set to "Authenticated users"?
2. ✅ Is there an INSERT policy?
3. ✅ Is RLS enabled on the avatars bucket?
