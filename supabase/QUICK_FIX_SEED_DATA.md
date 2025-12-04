# Quick Fix for Seed Data Error

## The Error
```
ERROR: column "typical_dose" of relation "medications" does not exist
```

This means you tried to insert into the `medications` table (user table) instead of `medications_master` (master/reference table).

## The Solution

The seed data file (`supabase/seed_data.sql`) is correct - it inserts into **master tables**, not user tables.

### Make sure you're running the correct file:

1. **Open:** `supabase/seed_data.sql` (the file I created)
2. **NOT:** The original seed data you provided (which had `INSERT INTO medications`)

### The seed_data.sql file should have:

- `INSERT INTO medications_master` ✅ (correct)
- `INSERT INTO vitamins_master` ✅
- `INSERT INTO exercises_master` ✅
- etc.

### It should NOT have:

- `INSERT INTO medications` ❌ (wrong - this is a user table)
- `INSERT INTO vitamins` ❌ (wrong)

## How to Run Correctly

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/seed_data.sql`
3. Copy the **entire contents**
4. Paste into SQL Editor
5. Click **Run**

## What Gets Created

The seed data creates **master/reference tables**:
- `medications_master` - Reference list of medications
- `vitamins_master` - Reference list of vitamins
- `exercises_master` - Reference list of exercises
- `symptoms_master` - Reference list of symptoms
- etc.

These are **read-only reference data** that users can select from.

## User Tables Stay Empty

The user tables (`medications`, `symptoms`, etc.) remain empty until users start tracking their own data. That's correct!

## If You Still Get Errors

1. Make sure you ran `schema.sql` first
2. Then run `seed_data.sql`
3. Check that the file says `medications_master` not `medications`




