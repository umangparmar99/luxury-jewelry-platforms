'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff, Gem } from 'lucide-react';

function LoginPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin, user } = useAuth();
  const redirectPath = searchParams.get('redirect') || '/catalog';

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { if (user) router.push(redirectPath); }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setIsLoading(true);
    try {
      await login(email, password);
      setSuccess('Authenticated. Redirecting…');
      setTimeout(() => router.push(redirectPath), 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally { setIsLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      await googleLogin('google_mock_token_collector');
      setSuccess('Signed in via Google. Redirecting…');
      setTimeout(() => router.push(redirectPath), 1000);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally { setIsLoading(false); }
  };

  return (
    <div
      className="w-full min-h-[90vh] flex items-center justify-center py-16 px-4 relative overflow-hidden font-sans"
      style={{ backgroundColor: '#060812' }}
    >
      {/* Background orbs */}
      <div className="orb orb-rose  absolute top-1/4  left-1/4  w-[500px] h-[500px] opacity-20" />
      <div className="orb orb-violet absolute bottom-1/4 right-1/4 w-[400px] h-[400px] opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div
          className="p-9 rounded-sm"
          style={{
            background: 'rgba(10,14,30,0.85)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(212,112,106,0.15)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(212,112,106,0.05)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)' }}>
              <Gem className="h-3 w-3" style={{ color: '#D4706A' }} />
              <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: '#E68C72' }}>
                Welcome Back
              </span>
            </div>
            <h1
              className="font-serif text-3xl font-light mb-2"
              style={{
                background: 'linear-gradient(135deg, #F5E6D0 0%, #DBBF88 50%, #D4706A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Collector Portal
            </h1>
            <p className="font-sans text-xs" style={{ color: 'rgba(219,191,136,0.4)' }}>
              Sign in to manage your custom ring builder and orders
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-4 rounded-sm flex items-start gap-2.5 text-xs"
              style={{ background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.25)', color: '#FF8A8A' }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-4 rounded-sm flex items-start gap-2.5 text-xs"
              style={{ background: 'rgba(212,112,106,0.1)', border: '1px solid rgba(212,112,106,0.25)', color: '#E68C72' }}
            >
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#D4706A' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'rgba(212,112,106,0.35)' }} />
                <input
                  type="email" required
                  placeholder="collector@beyondcarat.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-sm font-sans text-xs outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(6,8,18,0.7)',
                    border: '1px solid rgba(212,112,106,0.12)',
                    color: '#F0DFC8',
                  }}
                  onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.45)')}
                  onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.12)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="font-sans text-[10px] uppercase tracking-widest transition-colors duration-200" style={{ color: 'rgba(212,112,106,0.6)' }}>
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'rgba(212,112,106,0.35)' }} />
                <input
                  type={showPass ? 'text' : 'password'} required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-sm font-sans text-xs outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(6,8,18,0.7)',
                    border: '1px solid rgba(212,112,106,0.12)',
                    color: '#F0DFC8',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.45)')}
                  onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 transition-opacity duration-200"
                  style={{ color: 'rgba(212,112,106,0.4)' }}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="btn-rose w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <LogIn className="h-4 w-4 relative z-10" />
              <span className="relative z-10">{isLoading ? 'Authenticating…' : 'Sign In'}</span>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-7 flex items-center">
            <div className="flex-1 h-px" style={{ background: 'rgba(212,112,106,0.1)' }} />
            <span className="px-4 font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.25)' }}>
              Or Continue With
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(212,112,106,0.1)' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(212,112,106,0.15)',
              color: 'rgba(219,191,136,0.6)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(212,112,106,0.35)';
              e.currentTarget.style.color = '#F0DFC8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(212,112,106,0.15)';
              e.currentTarget.style.color = 'rgba(219,191,136,0.6)';
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.12 1 1.16 5.92 1.16 12s4.96 11 11.08 11c6.38 0 10.63-4.437 10.63-10.74 0-.72-.08-1.284-.18-1.975H12.24z" />
            </svg>
            Continue with Google
          </button>

          {/* Register link */}
          <p className="text-center font-sans text-[11px] mt-7" style={{ color: 'rgba(219,191,136,0.3)' }}>
            New to BeyondCarat?{' '}
            <Link
              href="/register"
              className="font-semibold transition-colors duration-200"
              style={{ color: '#D4706A' }}
            >
              Create Vault Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[90vh] flex items-center justify-center" style={{ backgroundColor: '#060812' }}>
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#D4706A', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
