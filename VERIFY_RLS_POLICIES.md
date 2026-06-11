# ✅ RLS Policy Verification Checklist

## Before You Sign Up Again

Use this checklist to verify your policies are correct.

---

## Profiles Table Policies

Go to **Authentication → Policies → profiles**

### ☐ SELECT Policy
- [ ] Name: `Users can select their own profile`
- [ ] Command: **SELECT**
- [ ] Applied to: **public** (or leave default)
- [ ] USING expression: `(auth.uid() = id)`

### ☐ INSERT Policy  
- [ ] Name: `Users can insert their own profile`
- [ ] Command: **INSERT**
- [ ] **Applied to: "Authenticated users"** (THIS IS CRITICAL!)
- [ ] USING expression: `(auth.uid() = id)`
- [ ] WITH CHECK expression: `(auth.uid() = id)`

### ☐ UPDATE Policy
- [ ] Name: `Users can update their own profile`
- [ ] Command: **UPDATE**
- [ ] **Applied to: "Authenticated users"** (THIS IS CRITICAL!)
- [ ] USING expression: `(auth.uid() = id)`
- [ ] WITH CHECK expression: `(auth.uid() = id)`

---

## Avatars Storage Bucket Policies

Go to **Storage → avatars → Policies**

### ☐ SELECT Policy
- [ ] Mode: **SELECT**
- [ ] Apply to: **Any users** or **All users** (doesn't matter)
- [ ] Expression: **BLANK** (leave empty)

### ☐ INSERT Policy
- [ ] Mode: **INSERT**
- [ ] Apply to: **Authenticated users** (CRITICAL!)
- [ ] Expression: **BLANK** (leave empty - test this first)

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| INSERT policy "Applied to" = public | Change to "Authenticated users" |
| Complex expression on INSERT | Leave blank or use `(bucket_id = 'avatars')` |
| No INSERT policy on storage | Add one! |
| Using old policy from before | Delete and create fresh |
| Expression has typos | Delete and create fresh |

---

## Step-by-Step Verification

### 1. Check Profiles Table Policies
```
Go to: Supabase → Authentication → Policies → profiles
Look for 3 policies listed below the table name
```

What you should see:
```
SELECT:  "Users can select their own profile"    [public]
INSERT:  "Users can insert their own profile"    [Authenticated users]
UPDATE:  "Users can update their own profile"    [Authenticated users]
```

If any are missing or wrong:
- Delete the wrong one (trash icon)
- Create a new one with correct settings

### 2. Check Avatars Storage Policies
```
Go to: Supabase → Storage → avatars → Policies
Look for 2 policies listed
```

What you should see:
```
SELECT:  [settings]  [blank expression]
INSERT:  [settings]  [blank expression]
```

### 3. Check RLS is ON/OFF
```
Profiles table: Should show "RLS is ON" (or have the toggle)
Avatars bucket: Should show "RLS is ON" (or have the toggle)
```

---

## After Verifying Policies

1. **Use a NEW email address** (don't retry with same one - creates duplicate key error)
2. **Sign up again**
3. **Check browser console** (F12):
   - ✅ Should see `Profile created successfully` 
   - ✅ Should see `Avatar uploaded` (if you chose a picture)
   - ❌ Should NOT see RLS errors

---

## If Still Failing After Verification

Try this **nuclear test** (for debugging only):

### Test 1: Disable RLS completely
1. profiles table → turn RLS OFF
2. avatars bucket → turn RLS OFF
3. Try signup
4. If this works → policies were wrong, not the code
5. Turn RLS back ON and fix policies

### Test 2: Check Supabase Status
- Go to https://status.supabase.com
- Make sure all services are operational
- Sometimes Supabase has issues

### Test 3: Clear Browser Cache
1. Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
2. Select "Cookies and cached data"
3. Delete all
4. Retry signup

---

## Screenshot Comparison

**Your current (WRONG):**
```
Users can insert their own profile    INSERT    public ❌
Users can select their own profile    SELECT    public ❌
```

**Should be (CORRECT):**
```
Users can insert their own profile    INSERT    Authenticated users ✅
Users can select their own profile    SELECT    public ✅
Users can update their own profile    UPDATE    Authenticated users ✅
```

The key difference: **INSERT and UPDATE must be "Authenticated users", not "public"**

---

## Before Contacting Support

Make sure you've checked:
- [ ] INSERT policy = "Authenticated users" (not "public")
- [ ] UPDATE policy exists and = "Authenticated users"
- [ ] SELECT policy = "public"
- [ ] All expressions are correct (or blank for storage)
- [ ] Used a NEW email (not retrying with same one)
- [ ] Cleared browser cache
- [ ] RLS is ON for both
