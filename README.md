# MenoEase - Complete Menopause Tracker

A comprehensive web application for tracking menopause symptoms, health metrics, and wellness data.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Hosting**: Netlify
- **Email**: EmailJS
- **SMS**: Twilio
- **Payments**: Stripe
- **Styling**: CSS Modules

## Features

- 📊 **Dashboard** - Daily overview and quick actions
- 🌙 **Sleep Tracking** - Quality, duration, night sweats
- 🍽️ **Food Logging** - Meal tracking with symptom correlation
- 📋 **Symptom Tracking** - Physical and emotional symptoms
- 💊 **Medication Management** - Track medications and therapies
- 🏃 **Exercise Logging** - Activity tracking
- 💆 **Mood & Wellness** - Energy, hydration, weather impact
- 📝 **Journal** - Daily reflections and insights
- 💡 **AI Insights** - Pattern detection and analytics
- 📄 **PDF Reports** - Export for healthcare providers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- EmailJS account (optional)
- Twilio account (optional)
- Stripe account (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd menotrak
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - Add other service keys as needed

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/          # Authentication components
│   ├── Layout/        # Layout components (Header, Nav)
│   └── UI/            # Basic UI components (Card, Button)
├── config/            # Configuration files
│   ├── supabase.js   # Supabase client
│   ├── emailjs.js    # EmailJS config
│   ├── stripe.js     # Stripe config
│   └── weather.js    # Weather API config
├── contexts/         # React contexts
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/           # Page components
│   ├── Auth/        # Login, Signup
│   ├── Dashboard/
│   ├── SleepLog/
│   ├── FoodLog/
│   ├── SymptomsTracker/
│   ├── Medications/
│   ├── Exercise/
│   ├── MoodWellness/
│   ├── Journal/
│   └── Insights/
├── services/        # API service functions
│   └── supabaseService.js
└── utils/          # Utility functions
    └── helpers.js
```

## Supabase Setup

### Database Schema

You'll need to create the following tables in Supabase:

1. **sleep_logs** - Sleep tracking data
2. **food_logs** - Food and meal logging
3. **symptoms** - Symptom tracking
4. **medications** - Medication management
5. **medication_logs** - Medication dose tracking
6. **exercises** - Exercise/activity logs
7. **mood_logs** - Mood and wellness data
8. **journal_entries** - Journal entries
9. **weather_data** - Weather information
10. **insights** - Pattern insights
11. **user_settings** - User preferences

### Row Level Security (RLS)

Enable RLS on all tables and create policies to ensure users can only access their own data.

## Deployment

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy!

The `netlify.toml` file is already configured for automatic deployments.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.




