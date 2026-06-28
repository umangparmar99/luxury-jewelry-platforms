'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, CheckCircle, AlertCircle, Eye, EyeOff, Gem } from 'lucide-react';

const inputStyle = {
  base: {
    background: 'rgba(6,8,18,0.7)',
    border: '1px solid rgba(212,112,106,0.12)',
    color: '#F0DFC8',
  },
  focus: { borderColor: 'rgba(212,112,106,0.45)' },
  blur:  { borderColor: 'rgba(212,112,106,0.12)' },
};

interface FieldProps {
  label: string; icon: React.ReactNode; required?: boolean; optional?: boolean;
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void;
}
function Field({ label, icon, required, optional, type = 'text', placeholder, value, onChange }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>
          {label}
        </label>
        {optional && (
          <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.3)' }}>
            Optional
          </span>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: focused ? 'rgba(212,112,106,0.55)' : 'rgba(212,112,106,0.3)' }}>
          {icon}
        </span>
        <input
          type={isPassword ? (showPass ? 'text' : 'password') : type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={e => { setFocused(true);  e.currentTarget.style.borderColor = 'rgba(212,112,106,0.45)'; }}
          onBlur={e  => { setFocused(false); e.currentTarget.style.borderColor = 'rgba(212,112,106,0.12)'; }}
          className="w-full pl-10 py-3 rounded-sm font-sans text-xs outline-none transition-all duration-300"
          style={{
            ...inputStyle.base,
            paddingRight: isPassword ? '2.5rem' : '1rem',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-3.5 transition-opacity"
            style={{ color: 'rgba(212,112,106,0.4)' }}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router    = useRouter();
  const { signup } = useAuth();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setIsLoading(true);
    try {
      await signup(name, email, password, phone || undefined);
      setSuccess('Vault account created! An email verification OTP has been dispatched.');
      setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email or phone may already be registered.');
    } finally { setIsLoading(false); }
  };

  return (
    <div
      className="w-full min-h-[90vh] flex items-center justify-center py-16 px-4 relative overflow-hidden font-sans"
      style={{ backgroundColor: '#060812' }}
    >
      {/* Background orbs */}
      <div className="orb orb-violet absolute top-1/4  right-1/4 w-[450px] h-[450px] opacity-15" />
      <div className="orb orb-rose  absolute bottom-1/4 left-1/4  w-[400px] h-[400px] opacity-18" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="p-9 rounded-sm"
          style={{
            background: 'rgba(10,14,30,0.88)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(212,112,106,0.15)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(151,128,255,0.04)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)' }}
            >
              <Gem className="h-3 w-3" style={{ color: '#D4706A' }} />
              <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: '#E68C72' }}>
                Join the Vault
              </span>
            </div>
            <h1
              className="font-serif text-3xl font-light mb-2"
              style={{
                background: 'linear-gradient(135deg, #F5E6D0, #DBBF88 50%, #D4706A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Create Vault Account
            </h1>
            <p className="font-sans text-xs" style={{ color: 'rgba(219,191,136,0.4)' }}>
              Become a collector to configure designs and secure appraisals
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-4 rounded-sm flex items-start gap-2.5 text-xs"
              style={{ background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.25)', color: '#FF8A8A' }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-4 rounded-sm flex items-start gap-2.5 text-xs"
              style={{ background: 'rgba(212,112,106,0.1)', border: '1px solid rgba(212,112,106,0.3)', color: '#E68C72' }}
            >
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Full Name"     icon={<User  className="h-4 w-4" />} required placeholder="Arthur Pendelton"        value={name}     onChange={setName} />
            <Field label="Email Address" icon={<Mail  className="h-4 w-4" />} required type="email" placeholder="collector@beyondcarat.com" value={email}    onChange={setEmail} />
            <Field label="Phone Number"  icon={<Phone className="h-4 w-4" />} optional type="tel"   placeholder="+1 555 019 9238"           value={phone}    onChange={setPhone} />
            <Field label="Password"      icon={<Lock  className="h-4 w-4" />} required type="password" placeholder="••••••••••••"          value={password} onChange={setPassword} />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="btn-rose w-full flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="relative z-10">
                {isLoading ? 'Creating Vault…' : 'Create Vault Account'}
              </span>
            </motion.button>
          </form>

          {/* Terms note */}
          <p className="font-sans text-[9px] text-center mt-5 leading-relaxed" style={{ color: 'rgba(219,191,136,0.2)' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="h-px mt-6" style={{ background: 'rgba(212,112,106,0.08)' }} />

          <p className="text-center font-sans text-[11px] mt-5" style={{ color: 'rgba(219,191,136,0.3)' }}>
            Already registered?{' '}
            <Link href="/login" className="font-semibold transition-colors duration-200" style={{ color: '#D4706A' }}>
              Collector Portal Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
