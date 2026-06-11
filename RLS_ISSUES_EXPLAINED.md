# 🎯 RLS Issue Summary & Solutions

## What Went Wrong

Your signup is failing because of **Row-Level Security (RLS) policies** missing on:
1. **profiles table** - Blocks profile creation (403 error)
2. **avatars bucket** - Blocks avatar uploads (RLS policy error)

---

## The Symptoms You're Seeing

✗ Profile picture won't upload
✗ Profile not saved to database (only radius showing as 2000)
✗ Username visible but comes from email, not profile
✗ Console errors: 403, 406, "violates row-level security policy"

---

## Solutions (Choose One)

### Option A: QUICKEST FIX (For Testing)
**File**: [RLS_QUICK_FIX.md](RLS_QUICK_FIX.md)

1. Temporarily disable RLS on profiles table and avatars bucket
2. Test signup - should work perfectly
3. Turn RLS back ON and add proper policies
4. **Time: 5-10 minutes**

### Option B: PROPER FIX (Recommended)
**File**: [RLS_POLICY_SETUP.md](RLS_POLICY_SETUP.md)

1. Follow detailed steps to set up policies correctly
2. Uses proper security restrictions
3. More complex but production-ready
4. **Time: 15-20 minutes**

### Option C: SQL SCRIPT (Advanced)
Run SQL commands directly in Supabase SQL Editor:

```sql
-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can select their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

---

## What Each Policy Does

| Policy | Table/Bucket | What It Controls | Permission |
|--------|--------------|------------------|-----------|
| SELECT | profiles | Users reading profile data | Own record only |
| INSERT | profiles | Users creating their profile | Own record only |
| UPDATE | profiles | Users editing their profile | Own record only |
| SELECT | avatars | Public access to images | Anyone can view |
| INSERT | avatars | Users uploading images | Authenticated users |

---

## After Fixing RLS

1. **Sign up with new account**
2. **Check browser console** (F12):
   - Should see ✅ logs, no ❌ errors
   - Profile should be created
   - Avatar should upload
3. **Check Supabase Dashboard**:
   - profiles table → your user record with all fields filled
   - avatars bucket → your profile picture file
4. **Login and verify**:
   - Profile picture displays in sidebar
   - Map centers to your interest area
   - Dogs filter by your location

---

## Common Questions

### Q: Why is this happening?
**A**: Supabase RLS policies are empty by default (for security). You need to configure them to allow your app to work.

### Q: Is it safe to disable RLS?
**A**: Only temporarily for testing. Always re-enable with proper policies for production.

### Q: Why does the username show then?
**A**: It's showing your email prefix, not the actual username from profiles table. The profile creation is failing, so username data was never saved.

### Q: Can I skip this step?
**A**: No - without proper RLS policies, the app can't save user data to the database.

---

## Next Steps

1. Choose a fix option (A, B, or C)
2. Apply RLS policies
3. Sign up again
4. Let me know if you still see errors!

**Recommended**: Start with **Option A** (Quick Fix) to verify everything else works, then apply **Option B** (Proper Fix) for security.

---

## Files to Reference

- 📄 [RLS_QUICK_FIX.md](RLS_QUICK_FIX.md) - Fast testing approach
- 📄 [RLS_POLICY_SETUP.md](RLS_POLICY_SETUP.md) - Detailed step-by-step guide
- 📄 [STORAGE_SETUP.md](STORAGE_SETUP.md) - Storage bucket setup
- 📄 [DEBUG_GUIDE.md](DEBUG_GUIDE.md) - Debugging console logs
