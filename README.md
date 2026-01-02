# Pattern League

A competitive visual memory skill game with daily challenges, leagues, ratings, and subscription unlocks.

## Features

- **Daily 3-Pack Challenges**: Complete Flash Grid, Sequence Forge, and Rotation Run each day
- **Weekly League Runs**: Chain all 3 modes for the ultimate challenge
- **Pattern Rating (PR)**: Elo-like rating system for each game mode
- **League System**: Climb from Bronze to Master league
- **Global Leaderboards**: Compete against players worldwide
- **Subscription Model**: Free tier with League+ for unlimited runs

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js Route Handlers (API), Supabase (Postgres + Auth)
- **Payments**: Stripe Subscriptions + Customer Portal
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **OG Images**: @vercel/og
- **Deployment**: Vercel + Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- PostHog account (optional)
- Sentry account (optional)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/pattern-memory-challenge.git
cd pattern-memory-challenge
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_WEEKLY_ID=price_...
STRIPE_PRICE_ANNUAL_ID=price_...

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry (optional)
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=

# Admin
ADMIN_API_KEY=your_admin_api_key
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in order:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL files in order:
# supabase/migrations/001_init.sql
# supabase/migrations/002_rls_policies.sql
# supabase/migrations/003_functions.sql
```

3. Enable Google OAuth in Supabase Auth settings (optional)

### 4. Stripe Setup

1. Create products and prices in Stripe Dashboard:
   - Weekly subscription: $6.99/week
   - Annual subscription: $39.99/year
2. Enable 7-day trial on both prices
3. Copy the price IDs to your .env.local

### 5. Stripe Webhook Testing

Use the Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
npm run stripe:listen
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
pattern-memory-challenge/
├── app/
│   ├── (marketing)/        # Landing, pricing, terms, privacy
│   ├── (auth)/             # Login, callback
│   ├── (app)/              # Authenticated app pages
│   └── api/                # API routes
├── components/
│   ├── app/                # App-specific components
│   ├── game/               # Game components
│   ├── leaderboards/       # Leaderboard components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── auth/               # Auth utilities
│   ├── game/               # Game logic
│   ├── stripe/             # Stripe utilities
│   ├── analytics/          # PostHog utilities
│   └── utils/              # General utilities
├── supabase/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## Game Modes

### Flash Grid
Memorize the position and colors of tiles in a grid before they disappear.

### Sequence Forge
Watch a sequence of colored shapes, then recreate it in order.

### Rotation Run
See a pattern, predict what it looks like after rotation or mirroring.

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Stripe Webhook

Configure your production webhook endpoint:
```
https://your-domain.com/api/stripe/webhook
```

Events to enable:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

## Disclaimer

**Important**: In-game skill metrics, scores, and ratings are for entertainment purposes only. They are not intended to assess, measure, or indicate cognitive ability, brain health, or medical conditions. Pattern League is not a medical device and should not be used for diagnostic purposes.

## License

MIT
