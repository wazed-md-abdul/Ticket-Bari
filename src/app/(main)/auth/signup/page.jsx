"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { UserPlus, User, Mail, Key, Image, AlertCircle, Sparkles, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";


export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = "";

      // 1. Upload profile image to ImgBB
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "e137d11ae145b9f6610a6d8377ef5413";
        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Failed to upload avatar image to ImgBB (status ${uploadRes.status}).`;
          throw new Error(errMsg);
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.data?.url || "";
      } else {
        // Fallback default avatar
        imageUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
      }

      // 2. Sign Up via BetterAuth (with custom additional fields)
      const res = await signUp.email({
        email,
        password,
        name,
        image: imageUrl,
        role: role, // Extends schema
       
      });

      if (res?.error) {
        setError(res.error.message || "Failed to register account.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--background)]">
      {/* Left side: Relevant Travel Image */}
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-[10s] hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=1080')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        
        {/* Floating Brand Elements */}
        <div className="relative z-10 p-12 max-w-lg text-white space-y-6">
          <Link href="/" className="flex items-center space-x-2 w-fit bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <Ticket className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-sans font-black tracking-widest text-white text-sm">
              TICKET<span className="text-[var(--primary)]">BARI</span>
            </span>
          </Link>
          <div className="space-y-3">
            <h2 className="text-3xl font-black leading-tight">Create Your Passenger Pass</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Join thousands of travelers who book bus seats, rail commutes, and flight schedules instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Sign Up Form */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create Account</h1>
            <p className="text-sm text-foreground/60">Sign up to purchase tickets or list schedules</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold border border-red-200/50 dark:border-red-955/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center space-x-1">
                <User className="w-3 h-3 text-[var(--primary)]" />
                <span>Full Name</span>
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-[var(--input)] border-[var(--border)] text-foreground placeholder:text-foreground/40 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center space-x-1">
                <Mail className="w-3 h-3 text-[var(--primary)]" />
                <span>Email Address</span>
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-[var(--input)] border-[var(--border)] text-foreground placeholder:text-foreground/40 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center space-x-1">
                <Key className="w-3 h-3 text-[var(--primary)]" />
                <span>Password</span>
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[var(--input)] border-[var(--border)] text-foreground placeholder:text-foreground/40 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[var(--primary)]" />
                <span>Register As</span>
              </label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[var(--input)] border-[var(--border)] text-foreground h-11"
              >
                <option value="user">User (Passenger)</option>
                <option value="vendor">Vendor (Transport Company)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center space-x-1">
                <Image className="w-3 h-3 text-[var(--primary)]" />
                <span>Profile Image</span>
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-[var(--input)] border-[var(--border)] text-foreground file:mr-4 file:py-2 file:px-3 file:border-0 file:bg-white/10 file:text-xs file:font-semibold file:text-[var(--primary)] hover:file:opacity-80 h-11 flex items-center"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--primary)] hover:opacity-95 text-white font-bold rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-foreground/60">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[var(--primary)] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
