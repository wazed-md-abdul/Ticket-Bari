import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">
              TICKETBARI
            </span>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              TicketBari is a premium ticket booking portal providing instant, zero-hidden-fee tickets for bus, train, and flights. Comfort at your fingertips.
            </p>
            {/* Rebranded X Social Logo */}
            <div className="flex items-center space-x-4 pt-2">
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="Follow us on X"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-white transition-colors">Find Tickets</Link>
              </li>
              <li>
                <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Payments Security */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Guaranteed Secure</h3>
            <p className="text-xs text-gray-500 leading-normal">
              All transactions are encrypted and processed securely by Stripe. We never store your card details.
            </p>
            {/* Stripe Badge */}
            <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-lg px-3.5 py-1.5 shadow-sm">
              <svg className="w-12 h-6 fill-current text-white" viewBox="0 0 40 24" aria-label="Stripe logo">
                <path d="M18.8 12.2c0-1.8-1-2.6-2.9-2.6-2.1 0-3.3 1-3.3 1V8.5c0-.9.7-1.5 1.5-1.5h4.7V5c0-1-.7-1.5-1.5-1.5h-4.9c-.8 0-1.5.7-1.5 1.5v7.2c0 1.8 1 2.6 2.9 2.6 2.1 0 3.3-1 3.3-1v2.1c0 .9-.7 1.5-1.5 1.5H11V19c0 1 .7 1.5 1.5 1.5h4.9c.8 0 1.5-.7 1.5-1.5v-6.8zM24 8.5c0-.9-.7-1.5-1.5-1.5H20v10.3c0 1 .7 1.5 1.5 1.5h1.1c.8 0 1.5-.7 1.5-1.5V8.5zM27 8.5V6h-2.5v2.5H22v10.3c0 1 .7 1.5 1.5 1.5H27v-2.5h-2.5V8.5H27zm7.2 3.7c0-1.8-1-2.6-2.9-2.6-2.1 0-3.3 1-3.3 1V5.2c0-1-.7-1.5-1.5-1.5h-1v15.2c0 1 .7 1.5 1.5 1.5H30v-2.5s-1.2 1-3.3 1c-1.9 0-2.9-.8-2.9-2.6v-3.7h10.4z" />
              </svg>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">SECURE</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} TicketBari. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
