'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

const S = {
  void: '#060812',
  rose: '#D4706A',
  cream: '#F0DFC8',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212,112,106,0.1)',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Concierge message logged successfully. We will reach out shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Could not log contact query.');
      }
    } catch {
      setError('Connection failure. Please verify backend state.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      {/* Background elements */}
      <div className="orb orb-violet h-[500px] w-[500px] top-[-50px] right-[-100px] opacity-25" />
      <div className="orb orb-rose h-[400px] w-[400px] bottom-[100px] left-[-200px] opacity-15" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-4 mb-20 max-w-2xl mx-auto">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: S.rose }}>
            Salon & Concierge
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
            Connect with Our Specialists
          </h1>
          <div className="divider-rose" />
          <p className="font-sans text-xs md:text-sm uppercase tracking-wider" style={{ color: S.creamDim }}>
            Book private viewings, check customizer statuses, or discuss bespoke layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* --- INFORMATION SIDEBAR --- */}
          <div className="lg:col-span-1 space-y-10">
            <div className="space-y-6">
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold animate-pulse" style={{ color: S.rose }}>
                Information
              </span>
              <h2 className="font-serif text-2xl font-light">Fifth Avenue Salon</h2>
              <p className="text-xs leading-relaxed" style={{ color: S.creamDim }}>
                Visit our private boutique by appointment only for personalized solitaire reviews and diamond inspections.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  label: 'Boutique Location',
                  value: '730 Fifth Avenue, Manhattan, NY 10019',
                },
                {
                  icon: Phone,
                  label: 'Specialist Line',
                  value: '+1 (800) 250-CARAT',
                },
                {
                  icon: Mail,
                  label: 'Concierge Mail',
                  value: 'concierge@beyondcarat.com',
                },
                {
                  icon: Clock,
                  label: 'Working Hours',
                  value: 'Mon - Sat: 10:00 AM - 6:00 PM EST',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4 items-start">
                  <div
                    className="h-8 w-8 shrink-0 rounded-sm flex items-center justify-center"
                    style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.15)' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: S.rose }} />
                  </div>
                  <div>
                    <span className="block font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.45)' }}>
                      {label}
                    </span>
                    <span className="block text-xs mt-0.5" style={{ color: S.cream }}>
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- CONTACT FORM --- */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 md:p-10 rounded-sm"
              style={{
                background: 'rgba(13,18,40,0.45)',
                border: S.borderFaint,
              }}
            >
              <h3 className="font-serif text-xl font-light mb-8">Direct Concierge Request</h3>

              {success && (
                <div className="mb-6 p-4 rounded-sm flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-sm flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block font-sans text-[9px] uppercase tracking-widest" style={{ color: S.creamDim }}>
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Sterling Archer"
                      className="w-full px-4 py-3 rounded-sm text-xs bg-void-900/60 outline-none transition-all duration-200"
                      style={{ border: S.borderFaint, color: S.cream }}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block font-sans text-[9px] uppercase tracking-widest" style={{ color: S.creamDim }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. sterling@isis.com"
                      className="w-full px-4 py-3 rounded-sm text-xs bg-void-900/60 outline-none transition-all duration-200"
                      style={{ border: S.borderFaint, color: S.cream }}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest" style={{ color: S.creamDim }}>
                    Request Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Bespoke Setting Sizing Query"
                    className="w-full px-4 py-3 rounded-sm text-xs bg-void-900/60 outline-none transition-all duration-200"
                    style={{ border: S.borderFaint, color: S.cream }}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest" style={{ color: S.creamDim }}>
                    Detailed Inquiries
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe your design specifications or request schedule times..."
                    className="w-full px-4 py-3 rounded-sm text-xs bg-void-900/60 outline-none transition-all duration-200 resize-none"
                    style={{ border: S.borderFaint, color: S.cream }}
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-rose-gold text-white font-sans text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm shadow-rose-glow flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform duration-200 disabled:opacity-40"
                >
                  {isSubmitting ? (
                    'Transmitting Message...'
                  ) : (
                    <>
                      <Send className="h-3 w-3" /> Transmit Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}
