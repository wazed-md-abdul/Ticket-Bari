# 🎫 TicketBari

> Premium full-stack ticket booking platform built with Next.js, Better Auth, Stripe, and MongoDB featuring passenger, vendor, and admin dashboards.

## 📖 Short Project Overview

TicketBari is a full-stack transportation ticket booking platform designed for the Bangladeshi travel ecosystem. Users can search, book, and manage bus, train, launch, and plane tickets through a modern and responsive interface. The platform includes dedicated dashboards for Passengers, Vendors, and Admins, secure authentication, online payments, and advanced booking management features.

## 🌐 Live Demo

🔗 https://ticketbari-client-pi.vercel.app

## 🖼️ Project Screenshot

![TicketBari Banner](./public/banner.png)

---

## 🛠️ Technologies Used

### Frontend

* Next.js 16
* React 19
* Tailwind CSS v4
* Swiper.js
* Lenis
* Lucide React

### Backend & Database

* Node.js
* MongoDB

### Authentication & Security

* Better Auth
* Google OAuth
* JWT

### Payment Integration

* Stripe

### Data Visualization

* Recharts

---

## ✨ Core Features

* Multi-transport ticket booking (Bus, Train, Launch, Plane)
* Smart ticket search and filtering system
* Secure Stripe payment integration
* Google OAuth authentication
* Passenger dashboard with booking tracking
* Vendor dashboard with ticket management
* Admin dashboard with user and fraud management
* Advertisement management system
* Responsive glassmorphism user interface
* SEO optimized architecture

---

## 📦 Dependencies

### Main Dependencies

```json
{
  "next": "16.2.9",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "better-auth": "^1.6.19",
  "stripe": "^22.2.1",
  "@stripe/stripe-js": "^9.8.0",
  "mongodb": "^7.3.0",
  "swiper": "^12.2.0",
  "lenis": "^1.3.23",
  "lucide-react": "^1.21.0",
  "recharts": "^3.8.1",
  "sonner": "^2.0.7"
}
```

## 🚀 Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ticketbari-client.git
cd ticketbari-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_SERVER_PUBLIC_URL=http://localhost:5000

NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret

MONGO_DB_URI=your_mongodb_uri

BETTER_AUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Run the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔗 Project Links

* **Live Site:** https://ticketbari-client-pi.vercel.app
* **Client Repository:** Add your client repository link
* **Server Repository:** Add your server repository link

---

## 👨‍💻 Author

Developed with ❤️ using Next.js, Better Auth, Stripe, and MongoDB.
