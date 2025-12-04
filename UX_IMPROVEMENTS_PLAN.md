# UX Improvements Plan

## Issues Identified
1. **Navigation Duplication:**
   - "Track" (bottom nav) = "Symptoms" page
   - "Wellness" (bottom nav) = "Mood" page = "Energy" drill down
   - Confusing and redundant

2. **Dashboard Energy Card:**
   - Should be labeled "Energy/Mood" since it tracks both

3. **No Quick Input:**
   - Users must navigate to full pages for simple inputs
   - Water, energy level could be sliders on dashboard

4. **Empty Insights Page:**
   - No analytics or patterns shown

## Proposed Solutions

### 1. Navigation Consolidation
**New Bottom Nav:**
- 🏠 Home (Dashboard)
- 📊 Track (Combined page: Symptoms + Mood/Energy tabs)
- 💡 Insights (Analytics & Patterns)
- 👤 Profile (Settings & Account)

**Benefits:**
- Eliminates duplication
- Clearer purpose for each nav item
- "Track" becomes the main tracking hub

### 2. Dashboard Quick Actions
**Add Sliders for Common Inputs:**
- Water intake slider (0-3L) - save directly from dashboard
- Energy level slider (0-11) - quick update without navigation
- Quick symptom toggle (most common 3-4 symptoms)

**Streamline Quick Log:**
- Keep essential: Sleep, Food, Exercise, Medications
- Remove redundant buttons (Symptoms, Mood already accessible via Track)

### 3. Combined Track Page
**Tabbed Interface:**
- Tab 1: Symptoms (current SymptomsTracker)
- Tab 2: Energy/Mood (current MoodWellness)
- Single page, easy switching

### 4. Insights Page Features
**Analytics to Show:**
- Energy trends (7/30 day charts)
- Symptom frequency heatmap
- Food-symptom correlations
- Sleep quality trends
- Pattern detection (e.g., "Hot flashes worse after spicy food")
- Weekly/monthly summaries

### 5. Space Optimization
- Replace button-heavy layouts with sliders where appropriate
- Use cards more efficiently
- Reduce scrolling
- Quick-save buttons for common actions

## Implementation Priority
1. ✅ Rename Energy card to "Energy/Mood"
2. ✅ Consolidate navigation (Track page with tabs)
3. ✅ Add dashboard sliders (water, energy)
4. ✅ Build Insights page
5. ✅ Streamline quick log buttons




