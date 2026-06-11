# ⚡ Quick Fix Checklist

## What's Fixed in Your Code ✅

- [x] Avatar upload now persists to database
- [x] Map panel detects when profile loads
- [x] Real-time profile updates work

## What YOU Need to Do 🚀

### Critical (Must Do) 
- [ ] Fix avatars bucket RLS policy:
  1. Go to Supabase → Storage → avatars → Policies
  2. Delete INSERT policy that says "public"
  3. Create NEW INSERT policy:
     - Mode: INSERT
     - Apply to: **Authenticated users** ⭐
     - Expression: Leave empty
     - Save

### Then Test
- [ ] Sign up with new email
- [ ] Upload profile picture
- [ ] Check browser console for success logs
- [ ] Verify avatar appears and avatar_url is in database

---

## Error You're Getting

```
StorageApiError: new row violates row-level security policy
```

**This is because:** INSERT policy is on "public" instead of "Authenticated users"

**Fix:** Change it to "Authenticated users" (see above)

---

## Expected Behavior After Fix

1. Sign up → profile created ✅
2. Upload avatar → stored immediately ✅
3. Map shows your area → circle visible right away ✅
4. No logout/login needed → works first time ✅

---

## Questions?

- Check: [COMPLETE_FIX_GUIDE.md](COMPLETE_FIX_GUIDE.md)
- Or: [AVATAR_RLS_FIX_STEP_BY_STEP.md](AVATAR_RLS_FIX_STEP_BY_STEP.md)
