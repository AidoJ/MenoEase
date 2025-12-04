# Next Phase Development Plan

## Current State Assessment

### ✅ What's Already Built:
- **Database Schema**: Subscription tiers, reminders, reminder_logs tables exist
- **User Profiles**: Can store subscription tier info
- **Basic Tier Display**: Profile page shows current tier
- **Master Data Tables**: All reference data tables exist

### ❌ What's Missing:
- **Subscription Management**: No Stripe integration, no upgrade/downgrade UI
- **Tier-Based Feature Restrictions**: All features accessible regardless of tier
- **Reminder Management UI**: No way for users to create/edit reminders
- **Email/SMS Integration**: EmailJS and Twilio not integrated
- **Admin Panel**: No admin interface for managing data/users

---

## Recommended Development Priority

### **PHASE 1: Reminder Management System** (Highest Priority)
**Why First**: 
- Core feature that differentiates tiers
- Users can start using immediately
- Foundation for communication system

**What to Build**:
1. **Reminders Page** (`/reminders`)
   - List of user's active reminders
   - Add/Edit/Delete reminders
   - Show reminder type (medication, tracking, check-in, custom)
   - Time picker and days of week selector
   - Respect tier limits (max reminders per day)

2. **Tier-Based Restrictions**
   - Check user's tier before allowing reminder creation
   - Show upgrade prompt if limit reached
   - Display tier limits clearly

3. **Reminder Preview**
   - Show next scheduled reminder
   - Countdown to next reminder

**Estimated Time**: 2-3 days

---

### **PHASE 2: Email/SMS Integration** (High Priority)
**Why Second**:
- Enables actual reminder delivery
- Required for subscription value
- Can test with free tier first

**What to Build**:
1. **Netlify Functions for Email/SMS**
   - Email function using EmailJS
   - SMS function using Twilio
   - Secure API keys in Netlify environment

2. **Reminder Scheduler**
   - Background job (cron or scheduled function)
   - Check reminders table for due reminders
   - Send via appropriate channel (email/SMS)
   - Log to reminder_logs

3. **User Preferences**
   - Email vs SMS preference
   - Notification settings in Profile

**Estimated Time**: 3-4 days

---

### **PHASE 3: Subscription Management** (High Priority)
**Why Third**:
- Revenue generation
- Users can upgrade when they need more features
- Stripe integration required

**What to Build**:
1. **Stripe Integration**
   - Stripe Checkout for subscriptions
   - Webhook handler for subscription events
   - Update user_profiles.subscription_tier on payment

2. **Subscription UI**
   - Upgrade page showing all tiers
   - Compare features side-by-side
   - "Manage Subscription" button in Profile
   - Cancel/upgrade/downgrade flows

3. **Tier Enforcement**
   - History limits (7/30/unlimited days)
   - Feature gates (insights, export, etc.)
   - Upgrade prompts when limits hit

**Estimated Time**: 4-5 days

---

### **PHASE 4: Admin Panel** (Medium Priority)
**Why Fourth**:
- Needed for managing master data
- User management
- Analytics and insights

**What to Build**:
1. **Admin Authentication**
   - Admin role check
   - Separate admin routes
   - Admin dashboard

2. **Master Data Management**
   - CRUD for medications_master
   - CRUD for food_items
   - CRUD for exercises_master
   - CRUD for symptoms_master
   - Easy bulk import/export

3. **User Management**
   - View all users
   - View user data/logs
   - Manually adjust subscription tiers
   - User analytics

4. **System Analytics**
   - Total users by tier
   - Active users
   - Reminder delivery stats
   - Popular features

**Estimated Time**: 5-6 days

---

## Detailed Implementation Plan

### Phase 1: Reminders Management

#### 1.1 Create Reminders Page
```
/src/pages/Reminders/Reminders.jsx
- List active reminders
- Add reminder modal
- Edit reminder modal
- Delete confirmation
- Show tier limits
```

#### 1.2 Reminder Form Components
```
/src/components/Reminders/ReminderForm.jsx
- Reminder type selector
- Time picker
- Days of week checkboxes
- Message template selector
```

#### 1.3 Tier Enforcement
```
/src/utils/tierUtils.js
- checkReminderLimit(userId)
- canCreateReminder(userId)
- getTierFeatures(userId)
```

#### 1.4 Update Profile Page
```
- Add "Reminders" section
- Link to reminders page
- Show current reminder count vs limit
```

---

### Phase 2: Email/SMS Integration

#### 2.1 Netlify Functions
```
/netlify/functions/send-email.js
- EmailJS integration
- Template rendering
- Error handling

/netlify/functions/send-sms.js
- Twilio integration
- Message formatting
- Error handling
```

#### 2.2 Reminder Scheduler
```
/netlify/functions/process-reminders.js
- Query due reminders
- Check user preferences
- Send via email or SMS
- Log to reminder_logs
- Handle failures gracefully
```

#### 2.3 User Preferences
```
- Add to Profile page
- Email/SMS toggle
- Phone number field (if SMS enabled)
```

---

### Phase 3: Subscription Management

#### 3.1 Stripe Setup
```
- Stripe account configuration
- Product/Price creation in Stripe Dashboard
- Webhook endpoint setup
```

#### 3.2 Stripe Integration
```
/netlify/functions/create-checkout.js
- Create Stripe Checkout session
- Pass user_id and tier_code

/netlify/functions/stripe-webhook.js
- Handle subscription.created
- Handle subscription.updated
- Handle subscription.deleted
- Update user_profiles table
```

#### 3.3 Subscription UI
```
/src/pages/Subscription/Subscription.jsx
- Tier comparison table
- Feature highlights
- Pricing display
- "Upgrade" buttons
- Current tier badge

/src/pages/Subscription/ManageSubscription.jsx
- Current subscription details
- Cancel subscription
- Change plan
- Payment method
- Billing history
```

#### 3.4 Tier Enforcement
```
/src/utils/tierUtils.js
- checkHistoryAccess(userId, date)
- canViewInsights(userId)
- canExportData(userId)
- showUpgradePrompt(feature)
```

---

### Phase 4: Admin Panel

#### 4.1 Admin Authentication
```
/src/contexts/AdminContext.jsx
- Admin role check
- Admin routes protection

/src/pages/Admin/AdminLogin.jsx
- Admin login (separate from user login)
```

#### 4.2 Admin Dashboard
```
/src/pages/Admin/Dashboard.jsx
- User stats
- Subscription stats
- System health
- Recent activity
```

#### 4.3 Master Data Management
```
/src/pages/Admin/MedicationsMaster.jsx
- List all medications
- Add/Edit/Delete
- Bulk import

/src/pages/Admin/FoodsMaster.jsx
- List all foods
- Add/Edit/Delete
- Category management

/src/pages/Admin/ExercisesMaster.jsx
- List all exercises/therapies
- Add/Edit/Delete

/src/pages/Admin/SymptomsMaster.jsx
- List all symptoms
- Add/Edit/Delete
```

#### 4.4 User Management
```
/src/pages/Admin/Users.jsx
- List all users
- Search/filter
- View user profile
- View user logs
- Manually adjust tier
- Deactivate user
```

---

## Technical Considerations

### Environment Variables Needed:
```
# Stripe
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# EmailJS
EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Admin
ADMIN_SECRET_KEY (for admin authentication)
```

### Database Updates Needed:
- Add `phone` field to user_profiles (for SMS)
- Add `notification_preference` field (email/sms/both)
- Add `admin_users` table (or use auth.users metadata)

### Security Considerations:
- Admin routes must be protected
- Stripe webhook signature verification
- Rate limiting on reminder sending
- Phone number validation for SMS

---

## Recommended Starting Point

**I recommend starting with Phase 1 (Reminders Management)** because:

1. ✅ **Immediate User Value**: Users can set up reminders right away
2. ✅ **Foundation for Communication**: Sets up the data structure for email/SMS
3. ✅ **Tier Differentiation**: Shows value of paid tiers
4. ✅ **No External Dependencies**: Can build without Stripe/EmailJS/Twilio first
5. ✅ **Quick Win**: Can be completed in 2-3 days

After Phase 1, you can:
- Test the reminder system manually
- Get user feedback
- Then add email/SMS (Phase 2)
- Then add subscriptions (Phase 3)
- Finally build admin panel (Phase 4)

---

## Questions to Consider:

1. **Reminder Frequency**: How often should the scheduler run? (Every hour? Every 15 minutes?)
2. **Email Templates**: What should reminder emails look like? (HTML templates needed)
3. **SMS Format**: Character limits? What info to include?
4. **Stripe Billing**: Monthly vs yearly? Trial periods?
5. **Admin Access**: How do you want to authenticate admins? (Separate login? Role-based?)

---

Would you like me to start with **Phase 1: Reminders Management**? I can build the complete reminders page with tier enforcement.




