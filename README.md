# TicketBari Client App

Welcome to **TicketBari** - a premium, state-of-the-art online ticket booking platform built with Next.js (App Router), Tailwind CSS (v4), Better Auth, Stripe, Swiper.js, and Lenis smooth scrolling.

## Key Features

- **Dynamic Hero Background**: Beautiful photo slider using Swiper.js changing automatically.
- **Unified Design System**: Sleek glassmorphism, responsive navigation bar, customized interactive buttons, card shadow enhancements, and harmonious HSL colors supporting light and dark modes.
- **Smooth Scroll Integration**: Integrated Lenis smooth scroll for a premium feel.
- **Search & Filter Flow**: Search by departure/arrival stations, transportation type (Bus, Train, Launch, Plane), and travel date.
- **Auth Page Redesign**: Grid layout showcasing gorgeous travel imagery side-by-side with modern, secure signup and sign-in credentials forms.

## User Roles & Dashboards

The system supports 3 primary roles synced seamlessly using query parameter states:

### 1. Passenger Dashboard (`/dashboard/user`)
- View booking statistics (Total booked, Paid tickets, Awaiting, Total spent).
- Interactive booking status tracker (Paid, Pending, Accepted).
- One-click payments integrated with Stripe checkout.
- Skeleton loading status.

### 2. Vendor Dashboard (`/dashboard/vendor`)
- Real-time revenue charts (using Recharts).
- Ticket management module (Add/Edit/Delete itineraries, set quantity/price, list features/perks).
- Accept or reject passenger booking requests.
- Account status warning (fraud alert).

### 3. Administrator Dashboard (`/dashboard/admin`)
- Total active itineraries, users, advertisements, and flagged fraud incidents overview.
- User management panel (change roles to user/vendor/admin, flag/unflag fraud).
- Ticket verification interface (approve/reject vendor tickets).
- Advertisement banner manager.

## Getting Started

1. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_SERVER_PUBLIC_URL=http://localhost:5000
   NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   BETTER_AUTH_SECRET=your_better_auth_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   MONGO_DB_URI=your_mongodb_uri
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development mode:
   ```bash
   npm run dev
   ```

4. Build production static bundle:
   ```bash
   npm run build
   ```

## Deploying to Vercel

Ensure all environment variables listed above are specified in Vercel's environment configuration before building. The Next.js client is configured out of the box to compile and host on Vercel.
