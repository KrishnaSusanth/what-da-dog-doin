# 🔍 Quick RLS Troubleshooting

## Fastest Way to Test: Disable RLS Temporarily

This helps identify if RLS policies are the issue. Do this **ONLY FOR TESTING**.

### Step 1: Disable RLS on profiles table
1. Go to Supabase Dashboard → **Authentication** (or **Database**)
2. Find **profiles** table
3. Look for **RLS** toggle in top-right
4. Click to turn **RLS OFF** (it should show "RLS is off")
5. **Important**: Save/apply changes

### Step 2: Disable RLS on avatars bucket
1. Go to **Storage**
2. Click **avatars** bucket
3. Look for **RLS** toggle
4. Click to turn **RLS OFF**

### Step 3: Test signup again
1. Clear browser cache (Cmd+Shift+Delete)
2. Sign up with new email
3. Upload profile picture
4. Check browser console

**Expected Results:**
- ✅ No "violates row-level security" errors
- ✅ Profile picture uploads successfully
- ✅ Profile data saved to database
- ✅ Able to login and see data

### Step 4: Turn RLS Back ON
Once testing works, re-enable RLS and set up proper policies:
1. Turn RLS back ON for profiles table
2. Turn RLS back ON for avatars bucket
3. Follow [RLS_POLICY_SETUP.md](RLS_POLICY_SETUP.md) to add policies

---

## Quick Policy Copy-Paste

If the detailed guide is too much, here's the minimal setup:

### For `profiles` table (execute in SQL editor):
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can read their own profile
CREATE POLICY "Users can select their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Users can create their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### For `avatars` bucket (via Supabase UI):
1. Add SELECT policy:
   - Authenticated and Anonymous users
   - Leave expression blank
   
2. Add INSERT policy:
   - Authenticated users only
   - Leave expression blank (or use `(auth.uid()::text = (storage.foldername(name))[1])`)

---

## Verification Checklist

After setting up policies, verify:

- [ ] RLS is ON for profiles table
- [ ] RLS is ON for avatars bucket
- [ ] profiles table has 3 policies (SELECT, INSERT, UPDATE)
- [ ] avatars bucket has 2 policies (SELECT, INSERT)
- [ ] Can sign up without errors
- [ ] Profile picture uploads successfully
- [ ] Profile data visible in Supabase dashboard
- [ ] Can login and see profile on main page

---

## Still Getting Errors?

Check the console error messages:

| Message | Solution |
|---------|----------|
| "violates row-level security policy" | Add INSERT policy to table |
| "Permission denied" (403) | Check RLS toggle is ON and policies exist |
| "row-level security" on storage | Add INSERT policy to avatars bucket |
| Profile is null | SELECT policy missing |
| Avatar uploads but not stored | INSERT policy on storage missing |

---

## One-Line Test

After signup, paste this in browser console to check if profile saved:

```javascript
const { data } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user.id).single(); console.log('Profile:', data)
```

If you see your profile data, everything works! 🎉
