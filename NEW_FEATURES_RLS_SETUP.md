# 🔐 RLS Policies for New Features

## stray_dogs Table Policies

### SELECT Policy (Everyone can view all dogs)
1. Name: `Users can view all dogs`
2. Command: **SELECT**
3. Apply to: **public**
4. Expression: Leave blank (everyone can read)

### INSERT Policy (Only authenticated users can add dogs)
1. Name: `Users can insert dogs`
2. Command: **INSERT**
3. Apply to: **Authenticated users**
4. Expression USING: `(auth.uid() = created_by)`
5. Expression WITH CHECK: `(auth.uid() = created_by)`

### UPDATE Policy (Only creator can update)
1. Name: `Users can update their own dogs`
2. Command: **UPDATE**
3. Apply to: **Authenticated users**
4. Expression USING: `(auth.uid() = created_by)`
5. Expression WITH CHECK: `(auth.uid() = created_by)`

### DELETE Policy (Only creator can delete)
1. Name: `Users can delete their own dogs`
2. Command: **DELETE**
3. Apply to: **Authenticated users**
4. Expression: `(auth.uid() = created_by)`

---

## activity_logs Table Policies

### SELECT Policy (Everyone can view activities)
1. Name: `Users can view all activities`
2. Command: **SELECT**
3. Apply to: **public**
4. Expression: Leave blank

### INSERT Policy (Only authenticated users can log activities)
1. Name: `Users can log activities`
2. Command: **INSERT**
3. Apply to: **Authenticated users**
4. Expression USING: `(auth.uid() = user_id)`
5. Expression WITH CHECK: `(auth.uid() = user_id)`

### DELETE Policy (Optional - if you want users to delete their own activity logs)
1. Name: `Users can delete their own activities`
2. Command: **DELETE**
3. Apply to: **Authenticated users**
4. Expression: `(auth.uid() = user_id)`

---

## Setup Steps

### For stray_dogs table:
1. Go to **Supabase Dashboard → Authentication → Policies**
2. Select **stray_dogs** table
3. Create all 4 policies above (SELECT, INSERT, UPDATE, DELETE)
4. Make sure INSERT and UPDATE are applied to "Authenticated users"

### For activity_logs table:
1. Go to **Supabase Dashboard → Authentication → Policies**
2. Select **activity_logs** table
3. Create all policies above
4. INSERT must be "Authenticated users"

---

## Verification

After setting up, test:

```javascript
// Test INSERT into stray_dogs
const { data, error } = await supabase
  .from('stray_dogs')
  .insert({
    name: 'Buddy',
    created_by: 'YOUR_USER_ID',
    last_location_lat: 17.6868,
    last_location_long: 83.2185
  })

// Test INSERT into activity_logs
const { data, error } = await supabase
  .from('activity_logs')
  .insert({
    dog_id: 'DOG_ID',
    user_id: 'YOUR_USER_ID',
    action_type: 'Spotted',
    notes: 'Test activity'
  })
```

Both should succeed if policies are set correctly.
