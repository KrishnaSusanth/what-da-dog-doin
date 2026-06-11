# 🔧 Avatar Storage RLS Fix

## Problem
Avatar uploads failing with: `"new row violates row-level security policy"`

This means the RLS policy on the **avatars storage bucket** is wrong.

---

## Quick Fix (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Click **Storage** → **avatars** bucket
2. Click **Policies** tab

### Step 2: Delete Wrong Policies
- Delete ANY policies that have complicated expressions
- Click the trash icon next to them
- You should start fresh

### Step 3: Add Correct Policies

#### SELECT Policy (Allow public read):
1. Click **+ New policy**
2. **Mode**: SELECT
3. **Apply to**: All users (or leave as Unauthenticated)
4. **Expression**: Leave **completely blank** (means no restrictions)
5. Click **Review** → **Save**

#### INSERT Policy (Allow authenticated upload):
1. Click **+ New policy**
2. **Mode**: INSERT
3. **Apply to**: Authenticated users (very important!)
4. **Expression**: Leave **completely blank** (for now - test this first)
5. Click **Review** → **Save**

---

## If Still Failing: Advanced Fix

If the above doesn't work, try this more specific expression for INSERT:

**For INSERT policy:**
- **Expression**: `(bucket_id = 'avatars')`

Or if that fails, use:
- **Expression**: `((auth.uid()::text = (storage.foldername(name))[1]) OR (storage.foldername(name))[1] IS NULL)`

---

## Testing Avatar Upload

1. Sign up with **new email** (don't retry with same email)
2. Upload a profile picture
3. Check browser console for:
   - ✅ `Avatar URL: https://...` = Success!
   - ❌ Any errors about RLS = Check policies

---

## The Key Differences

| What | Correct | Wrong |
|------|---------|-------|
| INSERT "Apply to" | **Authenticated users** | public |
| INSERT Expression | Blank or `(bucket_id = 'avatars')` | Complex expressions |
| SELECT "Apply to" | Any users or blank | Shouldn't matter |
| SELECT Expression | Blank | Shouldn't matter |

---

## Still Getting "RLS violation"?

Try the nuclear option (for testing only):

### Disable RLS on avatars bucket
1. Go to Storage → avatars bucket
2. Look for **RLS** toggle at top
3. Turn it **OFF** (if it's currently ON)
4. Test signup

If this works, you know it's an RLS policy expression issue. Then re-enable RLS and use blank expressions.

---

## Common Mistakes

❌ **WRONG**:
- INSERT applied to "public" (should be "Authenticated users")
- Complex expression like `(auth.uid()::text = (storage.foldername(name))[1])`
- Policy doesn't exist at all

✅ **RIGHT**:
- INSERT applied to "Authenticated users"
- Expression is blank (or very simple)
- Both SELECT and INSERT policies exist

