import Link from "next/link";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16 mt-auto relative overflow-hidden">
      {/* Background Decorative Accent Glow */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--primary)]/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: Brand & Desc */}
          <div className="space-y-4">
            <Logo variant="horizontal" size="md" light={true} />
            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-xs">
              Book bus, train, launch & flight tickets easily. Seamless, instant reservations and zero hidden markup fees.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">Navigation</h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-[var(--primary)] transition-colors duration-200 block w-fit hover:translate-x-1 transform transition-transform">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-[var(--primary)] transition-colors duration-200 block w-fit hover:translate-x-1 transform transition-transform">
                  All Tickets
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--primary)] transition-colors duration-200 block w-fit hover:translate-x-1 transform transition-transform">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--primary)] transition-colors duration-200 block w-fit hover:translate-x-1 transform transition-transform">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Coordinates */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">Support Line</h3>
            <ul className="space-y-3 text-xs font-semibold">
              <li className="flex items-center space-x-2.5 hover:text-white transition-colors duration-200">
                <Mail className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <a href="mailto:support@ticketbari.com">support@ticketbari.com</a>
              </li>
              <li className="flex items-center space-x-2.5 hover:text-white transition-colors duration-200">
                <Phone className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <a href="tel:+8801700000000">+880 1700 000000</a>
              </li>
              <li className="flex items-center space-x-2.5 hover:text-white transition-colors duration-200">
                <svg className="w-4 h-4 text-[var(--primary)] fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-4c-3.3 0-6 2.7-6 6v1z" />
                </svg>
                <a href="https://facebook.com/ticketbari" target="_blank" rel="noreferrer">Facebook Page</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Secure Checkouts */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">Newsletter</h3>
            <p className="text-[10px] text-slate-500 font-semibold leading-normal">
              Subscribe to get seasonal route discount notifications.
            </p>
            
            {/* Newsletter input */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 items-center max-w-xs focus-within:border-[var(--primary)] transition-all">
              <input 
                type="email" 
                placeholder="Enter email"
                className="bg-transparent text-xs px-3 py-1.5 focus:outline-none w-full text-white placeholder:text-slate-600"
              />
              <button className="p-1.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 active:scale-95 transition-all">
                <Send className="w-3 h-3" />
              </button>
            </div>

            {/* Payment badge */}
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2.5 bg-slate-900/60 border border-slate-850 rounded-xl px-3.5 py-2">
                <svg className="w-10 h-5 fill-current text-white" viewBox="0 0 40 24" aria-label="Stripe logo">
                  <path d="M18.8 12.2c0-1.8-1-2.6-2.9-2.6-2.1 0-3.3 1-3.3 1V8.5c0-.9.7-1.5 1.5-1.5h4.7V5c0-1-.7-1.5-1.5-1.5h-4.9c-.8 0-1.5.7-1.5 1.5v7.2c0 1.8 1 2.6 2.9 2.6 2.1 0 3.3-1 3.3-1v2.1c0 .9-.7 1.5-1.5 1.5H11V19c0 1 .7 1.5 1.5 1.5h4.9c.8 0 1.5-.7 1.5-1.5v-6.8zM24 8.5c0-.9-.7-1.5-1.5-1.5H20v10.3c0 1 .7 1.5 1.5 1.5h1.1c.8 0 1.5-.7 1.5-1.5V8.5zM27 8.5V6h-2.5v2.5H22v10.3c0 1 .7 1.5 1.5 1.5H27v-2.5h-2.5V8.5H27zm7.2 3.7c0-1.8-1-2.6-2.9-2.6-2.1 0-3.3 1-3.3 1V5.2c0-1-.7-1.5-1.5-1.5h-1v15.2c0 1 .7 1.5 1.5 1.5H30v-2.5s-1.2 1-3.3 1c-1.9 0-2.9-.8-2.9-2.6v-3.7h10.4z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[var(--primary)] leading-none">Stripe</span>
                  <span className="text-[6px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Verified</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <p>&copy; 2026 TicketBari. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-[var(--primary)] transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors duration-200">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
