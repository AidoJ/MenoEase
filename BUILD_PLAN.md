# MenoTrak Build Plan

## Current Status
✅ Authentication working
✅ Database schema complete
✅ Seed data ready
✅ Basic project structure

## Next Logical Steps

### Phase 1: Frontend - Master Lists Integration (Priority 1)

#### 1.1 Create Service Functions to Fetch Master Data
- `getMedicationsMaster()` - Fetch from `medications_master`
- `getSymptomsMaster()` - Fetch from `symptoms_master`
- `getExercisesMaster()` - Fetch from `exercises_master`
- `getVitaminsMaster()` - Fetch from `vitamins_master`
- `getTherapiesMaster()` - Fetch from `therapies_master`
- `getEnergyLevels()` - Fetch from `energy_levels`
- `getMoodLevels()` - Fetch from `mood_levels`
- `getFoodItems()` - Fetch from `food_items`

#### 1.2 Create Reusable Dropdown Components
- `SelectDropdown` - Generic dropdown component
- `MultiSelect` - For selecting multiple items (symptoms, etc.)
- `SearchableDropdown` - For food items with search

#### 1.3 Build First Feature: Sleep Logging
- Complete sleep log form
- Save to `sleep_logs` table
- Load existing sleep data
- Display on dashboard

#### 1.4 Build Second Feature: Symptoms Tracker
- Use `symptoms_master` for checkboxes
- Save to `symptoms` table
- Severity slider
- Display on dashboard

### Phase 2: Admin Panel (Priority 2)

#### 2.1 Admin Authentication
- Check if user is admin (add `is_admin` to user metadata or separate table)
- Admin-only routes
- Admin dashboard layout

#### 2.2 Master List Management
- **Medications Master** - Add/Edit/Delete
- **Symptoms Master** - Add/Edit/Delete
- **Exercises Master** - Add/Edit/Delete
- **Vitamins Master** - Add/Edit/Delete
- **Therapies Master** - Add/Edit/Delete
- **Food Items** - Add/Edit/Delete

#### 2.3 Admin UI Components
- Master list tables with CRUD operations
- Form modals for add/edit
- Delete confirmation dialogs
- Bulk import (optional)

### Phase 3: Complete Core Features (Priority 3)

#### 3.1 Food Logging
- Meal type selection
- Food search (using `food_items`)
- Post-meal symptoms
- Save to `food_logs`

#### 3.2 Medication Tracking
- Select from `medications_master` or add custom
- Schedule setup
- Daily checklist
- Adherence tracking

#### 3.3 Exercise Logging
- Select from `exercises_master`
- Duration and intensity
- Notes

#### 3.4 Mood & Wellness
- Energy level (from `energy_levels`)
- Mood level (from `mood_levels`)
- Symptoms (from `symptoms_master`)
- Hydration tracking

### Phase 4: Dashboard & Analytics (Priority 4)

#### 4.1 Dashboard with Real Data
- Load today's stats from all tables
- Recent entries
- Streak calculation
- Progress indicators

#### 4.2 Insights
- Pattern detection
- Correlations
- Charts and graphs

## Implementation Order

### Week 1: Foundation
1. ✅ Master list service functions
2. ✅ Reusable dropdown components
3. ✅ Sleep logging feature
4. ✅ Symptoms tracker feature

### Week 2: Admin Panel
1. ✅ Admin authentication setup
2. ✅ Admin dashboard
3. ✅ Master list CRUD operations

### Week 3: Core Features
1. ✅ Food logging
2. ✅ Medication tracking
3. ✅ Exercise logging
4. ✅ Mood & wellness

### Week 4: Polish
1. ✅ Dashboard with real data
2. ✅ Insights/analytics
3. ✅ Testing and bug fixes

## Technical Approach

### Frontend Architecture
```
src/
├── services/
│   ├── masterDataService.js    # Fetch master lists
│   └── supabaseService.js      # User data operations
├── components/
│   ├── Forms/
│   │   ├── SelectDropdown.jsx
│   │   ├── MultiSelect.jsx
│   │   └── SearchableDropdown.jsx
│   └── Admin/
│       ├── MasterListManager.jsx
│       └── AdminDashboard.jsx
└── pages/
    ├── Admin/
    │   └── MasterLists.jsx
    └── [existing pages]
```

### Admin Panel Approach
1. **Simple Admin Check**: Add `is_admin` boolean to user metadata
2. **Admin Routes**: Protected routes for admin pages
3. **Master List Management**: 
   - Table view of all items
   - Add/Edit modal forms
   - Delete with confirmation
   - Real-time updates (Supabase real-time subscriptions)

### Data Flow
1. **User selects from master list** → Frontend fetches from master table
2. **User saves tracking data** → Frontend saves to user table
3. **Admin adds to master list** → Admin panel inserts into master table
4. **All users see new option** → Next time they load the form

## Next Immediate Steps

1. **Create master data service** - Functions to fetch all master lists
2. **Create dropdown components** - Reusable components using master data
3. **Build sleep logging** - First feature using master data
4. **Build admin panel foundation** - Admin check and basic layout

Let's start with these!




