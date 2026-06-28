'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, KeyRound, Lock, AlertCircle, CheckCircle } from 'lucide-react';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Missing collector email details parameter in route context.');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email, code, password);
      setSuccess('Password updated successfully! Redirecting to collector portal login...');
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&reset=true`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Reset password process failed. Please check your reset code.');
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
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold-400 font-bold">Reset Password</span>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-white mt-1 leading-tight">Create New Credentials</h2>
          <p className="text-xs text-luxury-gold-200/50 mt-2">
            Configure a new secure password for <strong className="text-white">{email}</strong>
          </p>
          <span className="text-[9px] text-luxury-gold-200/30 uppercase block mt-1">
            (Check your backend server terminal logs for the generated OTP code)
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-sm text-xs flex items-start gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-luxury-gold-900/10 border border-luxury-gold-500/20 text-luxury-gold-400 rounded-sm text-xs flex items-start gap-2">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold mb-2">
              Recovery OTP Code (6-Digits)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4.5 w-4.5 text-luxury-gold-200/30" />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-luxury-slate-dark border border-luxury-gold-900/10 rounded-sm py-2 pl-10 pr-4 text-xs text-white placeholder-luxury-gold-200/20 text-center tracking-widest font-mono outline-none focus:border-luxury-gold-500/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold mb-2">
              New Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-luxury-gold-200/30" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-luxury-slate-dark border border-luxury-gold-900/10 rounded-sm py-2 pl-10 pr-4 text-xs text-white placeholder-luxury-gold-200/20 outline-none focus:border-luxury-gold-500/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-luxury-gold-200/30" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-luxury-slate-dark border border-luxury-gold-900/10 rounded-sm py-2 pl-10 pr-4 text-xs text-white placeholder-luxury-gold-200/20 outline-none focus:border-luxury-gold-500/40 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 bg-luxury-gold-500 hover:bg-luxury-gold-600 rounded-sm text-luxury-slate-dark text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
