# GitHub Update Commands

## Quick Update (All Changes)

```bash
# 1. Add all changes (new files, modified files, deleted files)
git add .

# 2. Commit with a descriptive message
git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway"

# 3. Push to GitHub
git push origin main
```

## Step-by-Step Commands

### Option 1: Add All Changes
```bash
# Stage all changes
git add .

# Commit
git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway"

# Push
git push origin main
```

### Option 2: Add Specific Files (if you want to be selective)
```bash
# Add specific files
git add src/components/DateNavigator/DateNavigator.jsx
git add src/pages/Dashboard/Dashboard.jsx
git add src/pages/Subscription/
git add netlify/functions/

# Commit
git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway"

# Push
git push origin main
```

### Option 3: Check Status First (Recommended)
```bash
# 1. Check what's changed
git status

# 2. See detailed changes
git diff

# 3. Add all changes
git add .

# 4. Commit
git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway"

# 5. Push
git push origin main
```

## If You Have Uncommitted Changes Already Staged

Since you already have some files staged, you can:

```bash
# 1. Add any remaining unstaged files
git add .

# 2. Commit everything
git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway"

# 3. Push
git push origin main
```

## If You Need to Update Remote Branch

```bash
# Pull latest changes first (if others are working on the repo)
git pull origin main

# Then push
git push origin main
```

## Complete Command Sequence

```bash
# Check current status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway"

# Push to GitHub
git push origin main
```

## If You Get Conflicts

```bash
# Pull and merge
git pull origin main

# Resolve conflicts, then:
git add .
git commit -m "Merge conflicts resolved"
git push origin main
```

## Quick One-Liner

```bash
git add . && git commit -m "Add swipe navigation, notes fields, subscription UI, and Stripe payment gateway" && git push origin main
```

