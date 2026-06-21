<p align="center">
  <img src="./public/banner.png" alt="TicketBari Banner" width="100%" />
</p>

<h1 align="center">🎫 TicketBari — Client</h1>

<p align="center">
  <b>Premium Online Ticket Booking Platform</b><br/>
  Book bus, train, launch & plane tickets with a seamless, modern experience.
</p>

<p align="center">
  <a href="https://ticketbari-client-pi.vercel.app">🌐 Live Site</a>
</p>

---

## 📸 Purpose

TicketBari is a full-stack, role-based online transportation ticket marketplace. Passengers can browse, search, and book tickets. Vendors can list routes and manage bookings. Admins control the entire platform — users, tickets, ads, and fraud detection.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Hero Slider** | Auto-rotating Swiper.js photo carousel with glassmorphism overlay |
| **Smart Search** | Filter by departure, arrival, transport type (Bus/Train/Launch/Plane), and date |
| **Stripe Payments** | Secure checkout sessions with webhook confirmation |
| **Google OAuth** | One-click Google sign-in via Better Auth social providers |
| **3 Role Dashboards** | Passenger, Vendor, and Admin — each with unique stats, tables, filters |
| **Real-time Clock** | Live clock displayed on every dashboard profile section |
| **Edit Profile Modal** | Update name & picture via Better Auth `updateUser` API |
| **Smooth Scrolling** | Lenis-powered buttery scroll across all pages |
| **Dark Glassmorphism UI** | Premium design with gradients, animations, skeleton loaders |
| **Numbered Pagination** | All tables use searchParams-based page navigation |
| **404 Page** | Animated not-found page with navigation back |
| **SEO Optimized** | Proper meta tags, semantic HTML, heading hierarchy |
| **Vercel Ready** | Configured for zero-config Vercel deployment |

---

## 🛠 NPM Packages Used

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.9 | React framework with App Router |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `better-auth` | ^1.6.19 | Authentication (email/password + Google OAuth + JWT) |
| `@stripe/stripe-js` | ^9.8.0 | Stripe client-side checkout |
| `stripe` | ^22.2.1 | Stripe server-side API (checkout sessions) |
| `mongodb` | ^7.3.0 | MongoDB driver for Better Auth database |
| `swiper` | ^12.2.0 | Hero image carousel slider |
| `lenis` | ^1.3.23 | Smooth scrolling library |
| `lucide-react` | ^1.21.0 | Icon library |
| `recharts` | ^3.8.1 | Dashboard chart visualizations |
| `sonner` | ^2.0.7 | Toast notification system |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind |
| `eslint` | ^9 | Code linting |
| `eslint-config-next` | 16.2.9 | Next.js ESLint rules |

---

## 👥 User Roles & Dashboards

### 1. 🧳 Passenger Dashboard (`/dashboard/user`)
- View booking stats (Total, Paid, Awaiting, Total Spent)
- Track booking status with animated progress bars
- One-click Stripe payment for accepted bookings
- Search & filter bookings with numbered pagination

### 2. 🚌 Vendor Dashboard (`/dashboard/vendor`)
- Revenue overview with Recharts bar/pie charts
- Full ticket CRUD — add routes with features, perks, pricing
- Accept/reject passenger booking requests
- Fraud status alert banner

### 3. 🛡️ Admin Dashboard (`/dashboard/admin`)
- Platform-wide stats (routes, users, ads, fraud count)
- User management — change roles, flag/unflag fraud
- Ticket approval/rejection workflow
- Advertisement banner management

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/ticketbari-client.git
cd ticketbari-client
npm install
```

### 2. Configure environment

Create `.env.local` in root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_SERVER_PUBLIC_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
BETTER_AUTH_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_secret
MONGO_DB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Run dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## ☁️ Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add all `.env.local` variables to Vercel Environment Variables
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
6. Deploy 🚀

---

<p align="center">
  Built with ❤️ using Next.js, Better Auth, Stripe & MongoDB
</p>
