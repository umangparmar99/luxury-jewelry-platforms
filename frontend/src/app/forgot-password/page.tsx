'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('If the account exists, a reset code has been sent. Redirecting to recovery verification...');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch {
      // Even on failure, redirect for user security to prevent email enumeration
      setSuccess('If the account exists, a reset code has been sent. Redirecting to recovery verification...');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-luxury-slate border border-luxury-gold-900/10 p-8 rounded shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold-400 font-bold">Identity Retrieval</span>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-white mt-1 leading-tight">Recover Account</h2>
          <p className="text-xs text-luxury-gold-200/50 mt-2">
            Enter your email below to request a security recovery OTP code
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-luxury-gold-900/10 border border-luxury-gold-500/20 text-luxury-gold-400 rounded-sm text-xs flex items-start gap-2">
            <KeyRound className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-luxury-gold-200/30" />
              <input
                type="email"
                required
                placeholder="collector@luxurybrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-luxury-slate-dark border border-luxury-gold-900/10 rounded-sm py-2 pl-10 pr-4 text-xs text-white placeholder-luxury-gold-200/20 outline-none focus:border-luxury-gold-500/40 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-luxury-gold-500 hover:bg-luxury-gold-600 rounded-sm text-luxury-slate-dark text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Sending Code...' : 'Request Reset OTP'}
          </button>
        </form>

        <p className="text-center text-[10px] tracking-wide text-luxury-gold-200/40 mt-8">
          <Link
            href="/login"
            className="text-luxury-gold-400 hover:text-white font-bold transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
