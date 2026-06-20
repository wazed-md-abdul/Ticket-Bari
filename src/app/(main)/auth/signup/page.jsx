"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { UserPlus, User, Mail, Key, Image, AlertCircle, Sparkles } from "lucide-react";
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500">Sign up to purchase tickets or list schedules</p>
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
              <User className="w-3 h-3" />
              <span>Full Name</span>
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Register As</span>
            </label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User (Passenger)</option>
              <option value="vendor">Vendor (Transport Company)</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
              <Image className="w-3 h-3" />
              <span>Profile Image</span>
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:mr-4 file:py-0 file:px-0 file:border-0 file:bg-transparent file:text-xs file:font-semibold file:text-[var(--primary)] hover:file:opacity-80"
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
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-indigo-500 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
