# Database Architecture Explanation

## Why Master Tables + User Tables?

### Master Tables (Reference Data)
These are **read-only reference lists** that provide standardized options:

- `medications_master` - List of common medications users can choose from
- `symptoms_master` - List of common symptoms users can select
- `exercises_master` - List of exercise types
- `vitamins_master` - List of vitamins/supplements
- `therapies_master` - List of therapy types
- `energy_levels` - Energy scale (1-5)
- `mood_levels` - Mood scale (1-5)

**Purpose:**
- Provides consistent, standardized options
- Makes dropdowns/autocomplete work easily
- Ensures data consistency across users
- Users can't modify these (read-only)

### User Tables (Personal Tracking Data)
These store **each user's actual tracking data**:

- `medications` - User's personal medications they're taking
- `symptoms` - User's symptom logs for each day
- `exercises` - User's exercise logs
- `sleep_logs` - User's sleep data
- `food_logs` - User's meal logs
- `mood_logs` - User's mood/wellness data
- `journal_entries` - User's journal entries

**Purpose:**
- Stores personal, user-specific data
- Each row belongs to a specific user (via `user_id`)
- Users can add/edit/delete their own data

## How They Work Together

### Example: Medications

1. **Master Table** (`medications_master`):
   ```
   id | name                    | type           | typical_dose
   1  | Estradiol Patch        | Hormone Therapy| 25-100 mcg/day
   2  | Progesterone           | Hormone Therapy| 100-200 mg/day
   ```

2. **User Table** (`medications`):
   ```
   id | user_id | name              | schedule
   x  | user123 | Estradiol Patch   | {time: "08:00", frequency: "daily"}
   y  | user123 | Magnesium         | {time: "21:00", frequency: "daily"}
   ```

**Flow:**
- User sees dropdown with options from `medications_master`
- User selects "Estradiol Patch" from the master list
- App creates entry in `medications` table with user's schedule
- User can also add custom medications not in master list

### Example: Symptoms

1. **Master Table** (`symptoms_master`):
   ```
   id | symptom      | category
   1  | Hot flashes  | Vasomotor
   2  | Night sweats | Vasomotor
   3  | Brain fog    | Cognitive
   ```

2. **User Table** (`symptoms`):
   ```
   id | user_id | date       | physical_symptoms          | severity
   x  | user123 | 2025-01-15 | ["Hot flashes", "Bloating"]| 7
   ```

**Flow:**
- User sees checklist with options from `symptoms_master`
- User checks "Hot flashes" and "Bloating"
- App saves to `symptoms` table with the selected symptoms
- Each user's symptom log is separate

## Benefits of This Architecture

### 1. **Data Consistency**
- All users see the same options
- Easier to analyze patterns across users
- Standardized terminology

### 2. **Better UX**
- Dropdowns/autocomplete work easily
- Users don't have to type everything
- Prevents typos and variations

### 3. **Analytics**
- Can analyze which medications are most common
- Can see symptom patterns across all users
- Easier to generate insights

### 4. **Flexibility**
- Users can still add custom items not in master lists
- Master lists can be updated without affecting user data
- Supports both standardized and custom tracking

## Alternative Approach (Simpler but Less Flexible)

We could skip master tables and just let users type everything:

**Pros:**
- Simpler database
- Fewer tables to manage

**Cons:**
- Inconsistent data ("Hot flash" vs "Hot flashes" vs "Hot Flash")
- Harder to analyze patterns
- Users have to type everything
- More typos and variations

## Current Architecture is Better For:

✅ Health tracking apps (needs consistency)
✅ Analytics and pattern detection
✅ Professional reports (standardized terms)
✅ User experience (dropdowns vs typing)

## Summary

- **Master Tables** = Reference lists (what users can choose from)
- **User Tables** = Personal data (what users actually track)
- They work together to provide both consistency and personalization

This is a common pattern in health/medical apps where you need both standardized options and personal tracking data.

