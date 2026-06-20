"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { LogIn, Key, Mail, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";


export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (res?.error) {
        setError(res.error.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      setError("Google Sign In failed.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to book and manage your tickets</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold border border-red-200/50 dark:border-red-950/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>Email Address</span>
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
              <Key className="w-3 h-3" />
              <span>Password</span>
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <hr className="w-full border-gray-200 dark:border-slate-800" />
          <span className="absolute bg-white dark:bg-slate-900 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">Or Continue With</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold transition-all-300 flex items-center justify-center space-x-2.5"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.468 0-6.28-2.812-6.28-6.28s2.812-6.28 6.28-6.28c1.637 0 3.125.626 4.248 1.648l3.123-3.123C19.262 2.693 15.98 1 12.24 1 5.922 1 12s4.922 11 11.24 11c6.518 0 11.24-4.582 11.24-11 0-.74-.067-1.455-.19-2.143H12.24z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-indigo-500 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
