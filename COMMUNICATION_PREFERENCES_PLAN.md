# Customizable Communication Preferences Plan

## Overview
Users should be able to customize their communication preferences based on their subscription tier, including:
- **Delivery Method**: Email, SMS, or Both
- **Reminder Frequency**: Every hour, every 2 hours, daily, etc.
- **Reminder Timing**: Start time (e.g., 7:00 AM)
- **Report Frequency**: Daily, Weekly, Monthly
- **Report Timing**: Specific time (e.g., 5:00 PM)

---

## Database Schema Updates

### 1. Add Communication Preferences to user_profiles
```sql
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}';

-- Structure:
{
  "reminders": {
    "method": "email" | "sms" | "both",
    "frequency": "hourly" | "every_2_hours" | "every_3_hours" | "daily" | "twice_daily",
    "start_time": "07:00",
    "end_time": "22:00",
    "enabled": true
  },
  "reports": {
    "frequency": "daily" | "weekly" | "monthly" | "none",
    "time": "17:00",
    "day_of_week": 1, -- For weekly (1=Monday, 7=Sunday)
    "day_of_month": 1, -- For monthly (1-28)
    "method": "email" | "sms" | "both",
    "enabled": true
  }
}
```

### 2. Update subscription_tiers to include communication features
```sql
-- Update features JSONB to include communication options
UPDATE subscription_tiers 
SET features = jsonb_set(
  features, 
  '{communication_options}', 
  '{"email": true, "sms": false, "custom_frequency": false}'::jsonb
)
WHERE tier_code = 'free';

UPDATE subscription_tiers 
SET features = jsonb_set(
  features, 
  '{communication_options}', 
  '{"email": true, "sms": true, "custom_frequency": true}'::jsonb
)
WHERE tier_code IN ('basic', 'premium', 'professional');
```

---

## UI Components to Build

### 1. Communication Preferences Page (`/settings/communication`)
**Location**: New page or section in Profile

**Features**:
- **Reminder Settings Section**
  - Toggle: Enable/Disable reminders
  - Method selector: Email / SMS / Both (based on tier)
  - Frequency selector: 
    - Free: Daily only
    - Basic+: Hourly, Every 2 hours, Every 3 hours, Daily, Twice daily
  - Start time picker: Time selector (default 7:00 AM)
  - End time picker: Time selector (default 10:00 PM)
  - Preview: "You'll receive reminders every hour from 7:00 AM to 10:00 PM"

- **Report Settings Section**
  - Toggle: Enable/Disable reports
  - Frequency selector: Daily / Weekly / Monthly / None
  - Time picker: Time selector (default 5:00 PM)
  - Day selector (for weekly): Monday-Sunday dropdown
  - Day selector (for monthly): 1-28 dropdown
  - Method selector: Email / SMS / Both
  - Preview: "You'll receive weekly reports every Monday at 5:00 PM"

- **Tier-Based Restrictions**
  - Show upgrade prompt if feature not available
  - Disable options not in current tier
  - Show tier comparison link

---

## Implementation Details

### Frequency Options by Tier:

**Free Tier:**
- Reminders: Daily only, Email only
- Reports: Weekly only, Email only

**Basic Tier:**
- Reminders: Daily, Twice daily, Email + SMS
- Reports: Daily, Weekly, Monthly, Email + SMS

**Premium/Professional:**
- Reminders: Hourly, Every 2 hours, Every 3 hours, Daily, Twice daily, Email + SMS
- Reports: Daily, Weekly, Monthly, Email + SMS, Custom timing

---

## Example User Preferences:

### Example 1: Hourly Reminders
```json
{
  "reminders": {
    "method": "both",
    "frequency": "hourly",
    "start_time": "07:00",
    "end_time": "22:00",
    "enabled": true
  },
  "reports": {
    "frequency": "weekly",
    "time": "17:00",
    "day_of_week": 1,
    "method": "email",
    "enabled": true
  }
}
```

### Example 2: Daily Reminders + Monthly Reports
```json
{
  "reminders": {
    "method": "email",
    "frequency": "daily",
    "start_time": "08:00",
    "end_time": "20:00",
    "enabled": true
  },
  "reports": {
    "frequency": "monthly",
    "time": "17:00",
    "day_of_month": 1,
    "method": "both",
    "enabled": true
  }
}
```

---

## Backend Processing Logic

### Reminder Scheduler
```javascript
// Pseudo-code for reminder processing
function processReminders() {
  // Get all active reminders
  // For each reminder:
  //   1. Check user's communication preferences
  //   2. Calculate next send time based on frequency
  //   3. If time matches, send via preferred method(s)
  //   4. Log to reminder_logs
}
```

### Report Generator
```javascript
// Pseudo-code for report generation
function generateReports() {
  // Get all users with reports enabled
  // For each user:
  //   1. Check report frequency and timing
  //   2. Generate report data (last 7/30 days based on tier)
  //   3. Send via preferred method
  //   4. Log delivery
}
```

---

## UI Mockup Structure

```
┌─────────────────────────────────────┐
│ Communication Preferences            │
├─────────────────────────────────────┤
│                                      │
│ 📱 Reminder Settings                 │
│ ┌─────────────────────────────────┐ │
│ │ ☑ Enable Reminders               │ │
│ │                                  │ │
│ │ Delivery Method:                 │ │
│ │ ○ Email  ● SMS  ○ Both          │ │
│ │                                  │ │
│ │ Frequency:                       │ │
│ │ [Every Hour ▼]                   │ │
│ │                                  │ │
│ │ Active Hours:                     │ │
│ │ From: [07:00 ▼] To: [22:00 ▼]   │ │
│ │                                  │ │
│ │ Preview:                         │ │
│ │ "Reminders every hour from       │ │
│ │  7:00 AM to 10:00 PM via SMS"    │ │
│ └─────────────────────────────────┘ │
│                                      │
│ 📊 Report Settings                   │
│ ┌─────────────────────────────────┐ │
│ │ ☑ Enable Reports                 │ │
│ │                                  │ │
│ │ Frequency:                       │ │
│ │ [Weekly ▼]                       │ │
│ │                                  │ │
│ │ Day: [Monday ▼] (for weekly)     │ │
│ │ Day: [1st ▼] (for monthly)       │ │
│ │                                  │ │
│ │ Time: [17:00 ▼]                  │ │
│ │                                  │ │
│ │ Delivery Method:                 │ │
│ │ ● Email  ○ SMS  ○ Both          │ │
│ │                                  │ │
│ │ Preview:                         │ │
│ │ "Weekly reports every Monday     │ │
│ │  at 5:00 PM via Email"           │ │
│ └─────────────────────────────────┘ │
│                                      │
│ [Save Preferences]                   │
└─────────────────────────────────────┘
```

---

## Next Steps

Would you like me to:
1. **Create the database migration** for communication preferences?
2. **Build the Communication Preferences UI page**?
3. **Add tier-based restrictions** to the form?
4. **Create the backend scheduler logic** for processing reminders/reports?

I recommend starting with #1 and #2 (database + UI) so users can set their preferences, then we can build the actual sending logic.




