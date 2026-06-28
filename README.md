<p align="center">
  <img src="./public/banner.png" alt="TicketBari Banner" width="100%" />
</p>

<h1 align="center">🎫 TicketBari</h1>

<p align="center">
  <strong>Premium Online Ticket Booking Platform for Bangladesh</strong><br/>
  <sub>Book bus, train, launch &amp; plane tickets with a seamless, modern experience.</sub>
</p>

<p align="center">
  <a href="https://ticketbari-client-pi.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20Site-6c63ff?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/MongoDB-Driver-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## 📖 Overview

**TicketBari** is a full-stack, role-based online transportation ticket marketplace built for the Bangladeshi travel ecosystem. Passengers can browse, search, and book tickets across multiple transport modes. Vendors can list routes and manage their bookings. Admins control the entire platform — users, tickets, ads, and fraud detection.

> Built with Next.js App Router, Better Auth, Stripe, and a dark glassmorphism design system.

---

## ✨ Features

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>🎠 <strong>Hero Slider</strong></td><td>Auto-rotating Swiper.js carousel with glassmorphism overlays</td></tr>
    <tr><td>🔍 <strong>Smart Search</strong></td><td>Filter by departure, arrival, transport type (Bus / Train / Launch / Plane), and date</td></tr>
    <tr><td>💳 <strong>Stripe Payments</strong></td><td>Secure checkout sessions with webhook confirmation</td></tr>
    <tr><td>🔐 <strong>Google OAuth</strong></td><td>One-click sign-in via Better Auth social providers</td></tr>
    <tr><td>👥 <strong>3 Role Dashboards</strong></td><td>Dedicated dashboards for Passenger, Vendor, and Admin roles</td></tr>
    <tr><td>🕐 <strong>Real-time Clock</strong></td><td>Live clock displayed on every dashboard profile section</td></tr>
    <tr><td>✏️ <strong>Edit Profile</strong></td><td>Update name &amp; avatar via Better Auth <code>updateUser</code> API</td></tr>
    <tr><td>🌀 <strong>Smooth Scrolling</strong></td><td>Lenis-powered buttery scroll across all pages</td></tr>
    <tr><td>🎨 <strong>Glassmorphism UI</strong></td><td>Dark premium design with gradients, animations &amp; skeleton loaders</td></tr>
    <tr><td>📄 <strong>Pagination</strong></td><td>All tables use <code>searchParams</code>-based numbered page navigation</td></tr>
    <tr><td>🚫 <strong>404 Page</strong></td><td>Animated not-found page with navigation back</td></tr>
    <tr><td>🔎 <strong>SEO Optimized</strong></td><td>Proper meta tags, semantic HTML, and heading hierarchy</td></tr>
  </tbody>
</table>

---

## 👥 User Roles & Dashboards

### 🧳 Passenger — `/dashboard/user`

- View booking stats: Total, Paid, Awaiting, Total Spent
- Track booking status with animated progress bars
- One-click Stripe payment for accepted bookings
- Search & filter bookings with numbered pagination

### 🚌 Vendor — `/dashboard/vendor`

- Revenue overview with Recharts bar & pie charts
- Full ticket CRUD — add routes with features, perks & pricing
- Accept or reject passenger booking requests
- Fraud status alert banner

### 🛡️ Admin — `/dashboard/admin`

- Platform-wide stats: routes, users, ads, fraud count
- User management — change roles, flag/unflag fraud
- Ticket approval & rejection workflow
- Advertisement banner management

---

## 🛠️ Tech Stack

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.2.9` | React framework with App Router |
| `react` | `19.2.4` | UI library |
| `react-dom` | `19.2.4` | React DOM renderer |
| `better-auth` | `^1.6.19` | Auth — email/password + Google OAuth + JWT |
| `@stripe/stripe-js` | `^9.8.0` | Stripe client-side checkout |
| `stripe` | `^22.2.1` | Stripe server-side API |
| `mongodb` | `^7.3.0` | MongoDB driver for Better Auth |
| `swiper` | `^12.2.0` | Hero image carousel slider |
| `lenis` | `^1.3.23` | Smooth scrolling |
| `lucide-react` | `^1.21.0` | Icon library |
| `recharts` | `^3.8.1` | Dashboard chart visualizations |
| `sonner` | `^2.0.7` | Toast notifications |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | `^4` | Utility-first CSS framework |
| `@tailwindcss/postcss` | `^4` | PostCSS plugin for Tailwind |
| `eslint` | `^9` | Code linting |
| `eslint-config-next` | `16.2.9` | Next.js ESLint rules |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ticketbari-client.git
cd ticketbari-client
npm install
```

### 2. Configure Environment

Create `.env.local` in the project root:

```env
# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_SERVER_PUBLIC_URL=http://localhost:5000

# Services
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret
MONGO_DB_URI=your_mongodb_uri

# Auth
BETTER_AUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## ☁️ Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Add all `.env.local` keys to **Environment Variables**
4. Set `NEXT_PUBLIC_APP_URL` → your production domain
5. Set `NEXT_PUBLIC_API_URL` → your deployed backend URL
6. Click **Deploy** 🚀

---

<p align="center">
  <sub>Built with ❤️ using Next.js · Better Auth · Stripe · MongoDB</sub>
</p>
