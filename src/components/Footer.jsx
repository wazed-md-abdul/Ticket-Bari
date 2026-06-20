import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-emerald-950/25 text-emerald-900/60 dark:text-emerald-100/60 border-t border-[var(--border)] py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Logo & description */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent tracking-wider">
              TICKETBARI
            </span>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Book bus, train, launch & flight tickets easily. Fast, secure, and zero hidden fees.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-slate-200 font-extrabold text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-[var(--primary)] transition-colors">All Tickets</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--primary)] transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--primary)] transition-colors">About</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-slate-200 font-extrabold text-sm uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <a href="mailto:support@ticketbari.com" className="hover:underline">support@ticketbari.com</a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                <a href="tel:+8801700000000" className="hover:underline">+880 1700 000000</a>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[var(--primary)] fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-4c-3.3 0-6 2.7-6 6v1z" />
                </svg>
                <a href="https://facebook.com/ticketbari" target="_blank" rel="noreferrer" className="hover:underline">Facebook Page</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-slate-200 font-extrabold text-sm uppercase tracking-wider">Payment Methods</h3>
            <p className="text-xs text-gray-500 leading-normal">
              Fully encrypted and secure checkouts powered by Stripe.
            </p>
            {/* Stripe Badge */}
            <div className="inline-flex items-center space-x-2 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl px-3.5 py-2 shadow-sm">
              <svg className="w-12 h-6 fill-current text-slate-800 dark:text-slate-200" viewBox="0 0 40 24" aria-label="Stripe logo">
                <path d="M18.8 12.2c0-1.8-1-2.6-2.9-2.6-2.1 0-3.3 1-3.3 1V8.5c0-.9.7-1.5 1.5-1.5h4.7V5c0-1-.7-1.5-1.5-1.5h-4.9c-.8 0-1.5.7-1.5 1.5v7.2c0 1.8 1 2.6 2.9 2.6 2.1 0 3.3-1 3.3-1v2.1c0 .9-.7 1.5-1.5 1.5H11V19c0 1 .7 1.5 1.5 1.5h4.9c.8 0 1.5-.7 1.5-1.5v-6.8zM24 8.5c0-.9-.7-1.5-1.5-1.5H20v10.3c0 1 .7 1.5 1.5 1.5h1.1c.8 0 1.5-.7 1.5-1.5V8.5zM27 8.5V6h-2.5v2.5H22v10.3c0 1 .7 1.5 1.5 1.5H27v-2.5h-2.5V8.5H27zm7.2 3.7c0-1.8-1-2.6-2.9-2.6-2.1 0-3.3 1-3.3 1V5.2c0-1-.7-1.5-1.5-1.5h-1v15.2c0 1 .7 1.5 1.5 1.5H30v-2.5s-1.2 1-3.3 1c-1.9 0-2.9-.8-2.9-2.6v-3.7h10.4z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--primary)] leading-none">Stripe</span>
                <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">Secure</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium">
          <p>&copy; 2025 TicketBari. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
