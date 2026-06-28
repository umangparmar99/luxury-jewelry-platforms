'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, User, ShieldCheck, Check, Info, Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface Gemologist {
  id: string;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
}

const gemologists: Gemologist[] = [
  {
    id: 'gem-1',
    name: 'Dr. Evelyn Vance, G.G.',
    title: 'Lead Resident Gemologist',
    specialty: 'Rare Large-Carat Diamonds & Fancy Colors',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'gem-2',
    name: 'Marcus Chen, G.G.',
    title: 'Bespoke Ring Designer & Specialist',
    specialty: 'Platinum Solitaires & Custom Setting Structures',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
  },
];

const consultationTypes = [
  { id: 'custom-ring', label: 'Bespoke Ring Design', duration: '45 mins', icon: '💍', desc: 'Collaboratively draft and render standard setting combinations or unique structures.' },
  { id: 'diamond-select', label: 'Loose Diamond Vault Inspection', duration: '30 mins', icon: '💎', desc: 'Compare GIA cert specifications, clarity metrics, and carat weights live.' },
  { id: 'appraisal', label: 'Identity & Appraisal Verify', duration: '30 mins', icon: '📜', desc: 'Consult on GIA laser inscriptions, shipping security controls, and certificate checks.' },
];

const availableTimes = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

// Generate next 7 days list
const getUpcomingDates = () => {
  const dates = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    // Skip Sundays
    if (d.getDay() !== 0) {
      dates.push({
        raw: d,
        dayName: daysOfWeek[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        formatted: `${daysOfWeek[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`,
      });
    }
  }
  return dates;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const upcomingDates = getUpcomingDates();

  // Booking states
  const [selectedType, setSelectedType] = useState(consultationTypes[0].id);
  const [selectedGemologist, setSelectedGemologist] = useState(gemologists[0].id);
  const [selectedDate, setSelectedDate] = useState(upcomingDates[0]);
  const [selectedTime, setSelectedTime] = useState(availableTimes[0]);
  
  // Guest Details Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // App States
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in your name and email address.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    // Mock API Delay
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingConfirmed(true);
    }, 1500);
  };

  const activeConsultation = consultationTypes.find((t) => t.id === selectedType);
  const activeGemologist = gemologists.find((g) => g.id === selectedGemologist);

  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold mb-3 inline-block">
            Virtual Salon Access
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide text-white leading-tight">
            Schedule a Private Consultation
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-luxury-gold-100/70 mt-4 leading-relaxed">
            Reserve a private video or audio appointment with our resident GIA gemologists. Review loose certified diamonds, custom layouts, or security logistics from the comfort of your home.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!bookingConfirmed ? (
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleBookingSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Select Type, specialist, date/time */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {/* 1. Select Consultation Type */}
                <div className="flex flex-col gap-4">
                  <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-luxury-gold-500 font-mono">01.</span> Consultation Purpose
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {consultationTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`text-left p-4 border rounded-sm transition-all duration-300 flex flex-col justify-between h-40 ${
                          selectedType === type.id
                            ? 'bg-luxury-gold-950/20 border-luxury-gold-500 shadow-md scale-[1.01]'
                            : 'bg-luxury-slate/20 border-luxury-gold-900/10 hover:border-luxury-gold-500/25'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="text-[8px] font-mono tracking-widest bg-luxury-slate-dark/80 px-2 py-0.5 rounded border border-luxury-gold-900/10 text-luxury-gold-400">
                            {type.duration}
                          </span>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-xs font-bold uppercase text-white">{type.label}</h4>
                          <p className="text-[9px] text-luxury-gold-200/50 leading-relaxed mt-1 line-clamp-2">
                            {type.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Select GIA Specialist */}
                <div className="flex flex-col gap-4 border-t border-luxury-gold-900/10 pt-8">
                  <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-luxury-gold-500 font-mono">02.</span> GIA Resident Specialist
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gemologists.map((gem) => (
                      <button
                        key={gem.id}
                        type="button"
                        onClick={() => setSelectedGemologist(gem.id)}
                        className={`text-left p-4 border rounded-sm transition-all duration-300 flex items-center gap-4 ${
                          selectedGemologist === gem.id
                            ? 'bg-luxury-gold-950/20 border-luxury-gold-500 shadow-md scale-[1.01]'
                            : 'bg-luxury-slate/20 border-luxury-gold-900/10 hover:border-luxury-gold-500/25'
                        }`}
                      >
                        <img
                          src={gem.avatar}
                          alt={gem.name}
                          className="h-12 w-12 rounded-full border border-luxury-gold-500/35 object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold uppercase text-white">{gem.name}</h4>
                          <div className="text-[9px] text-luxury-gold-500 uppercase tracking-widest font-mono mt-0.5 leading-none">
                            {gem.title}
                          </div>
                          <p className="text-[9px] text-luxury-gold-200/50 mt-1 leading-relaxed">
                            Focus: {gem.specialty}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Select Date and Time */}
                <div className="flex flex-col gap-4 border-t border-luxury-gold-900/10 pt-8">
                  <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-luxury-gold-500 font-mono">03.</span> Availability & Schedule
                  </h2>
                  
                  {/* Date swatches */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {upcomingDates.map((dt) => (
                      <button
                        key={dt.formatted}
                        type="button"
                        onClick={() => setSelectedDate(dt)}
                        className={`flex flex-col items-center justify-center p-3 min-w-[70px] border rounded-sm transition-all duration-300 ${
                          selectedDate.formatted === dt.formatted
                            ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark scale-105'
                            : 'bg-luxury-slate/10 border-luxury-gold-900/10 hover:border-luxury-gold-500/20 text-luxury-gold-200'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider font-bold mb-1">{dt.dayName}</span>
                        <span className="text-base font-serif font-bold leading-none">{dt.dayNum}</span>
                        <span className="text-[8px] uppercase mt-1 leading-none font-mono opacity-80">{dt.month}</span>
                      </button>
                    ))}
                  </div>

                  {/* Time slots */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 text-[10px] font-bold font-mono border rounded-sm transition-colors text-center ${
                          selectedTime === time
                            ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark shadow'
                            : 'bg-transparent border-luxury-gold-900/15 hover:border-luxury-gold-500/20 text-luxury-gold-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Contact Details, Summary and Book */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-luxury-slate/20 border border-luxury-gold-900/10 rounded-sm p-6 flex flex-col gap-6 h-fit">
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider border-b border-luxury-gold-900/10 pb-4">
                    Appraisal Appointment
                  </h3>
                  
                  {/* Summary items */}
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Specialist:</span>
                      <span className="text-white font-bold text-right">{activeGemologist?.name}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Session Type:</span>
                      <span className="text-white font-bold text-right">{activeConsultation?.label}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Scheduled Time:</span>
                      <span className="text-luxury-gold-300 font-bold font-mono">
                        {selectedDate.formatted} @ {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Platform:</span>
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-luxury-gold-400" /> Virtual Video
                      </span>
                    </div>
                  </div>

                  {/* Input Form */}
                  <div className="border-t border-luxury-gold-900/10 pt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-bold">Your Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter name"
                        className="bg-luxury-slate-dark border border-luxury-gold-900/20 rounded-sm py-2.5 px-3 text-xs text-white placeholder-luxury-gold-200/25 outline-none focus:border-luxury-gold-500 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-bold">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter email address"
                        className="bg-luxury-slate-dark border border-luxury-gold-900/20 rounded-sm py-2.5 px-3 text-xs text-white placeholder-luxury-gold-200/25 outline-none focus:border-luxury-gold-500 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-bold">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="bg-luxury-slate-dark border border-luxury-gold-900/20 rounded-sm py-2.5 px-3 text-xs text-white placeholder-luxury-gold-200/25 outline-none focus:border-luxury-gold-500 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-bold">Special Requests / Notes</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Inspecting GIA-123456789 diamond details"
                        className="bg-luxury-slate-dark border border-luxury-gold-900/20 rounded-sm py-2.5 px-3 text-xs text-white placeholder-luxury-gold-200/25 outline-none focus:border-luxury-gold-500 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-[10px] text-red-400 uppercase tracking-widest font-semibold font-mono">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{isSubmitting ? 'Verifying Calendar Slots...' : 'Confirm Appointment'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex gap-2 items-start mt-2">
                    <Info className="h-3.5 w-3.5 text-luxury-gold-500 shrink-0 mt-0.5" />
                    <p className="text-[8px] text-luxury-gold-200/40 leading-relaxed uppercase">
                      Confirmations, secure video conference credentials and appraisal agendas will be dispatched to your email mailbox instantly.
                    </p>
                  </div>
                </div>
              </div>

            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="max-w-2xl mx-auto bg-luxury-slate/20 border border-luxury-gold-500/30 p-10 text-center rounded-sm flex flex-col items-center gap-6"
            >
              <div className="h-16 w-16 bg-luxury-gold-900/20 border border-luxury-gold-500/40 rounded-full flex items-center justify-center text-3xl shadow">
                ✨
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold-500 font-semibold font-sans">
                  Reservation Confirmed
                </span>
                <h2 className="font-serif text-3xl font-bold text-white mt-1">
                  Your Consultation Is Booked
                </h2>
                <div className="h-0.5 w-12 bg-luxury-gold-500 mx-auto mt-4" />
              </div>

              <p className="text-xs text-luxury-gold-100/70 leading-relaxed max-w-md">
                Thank you for scheduling a private bespoke consultation with BeyondCarat. A calendar invite containing secure video login credentials has been sent to <span className="text-white font-semibold">{email}</span>.
              </p>

              {/* Confirmed details card */}
              <div className="w-full bg-luxury-slate-dark/60 border border-luxury-gold-900/10 p-5 rounded-sm text-left text-xs flex flex-col gap-3 font-sans">
                <div className="flex justify-between">
                  <span className="text-luxury-gold-200/50 uppercase">Specialist:</span>
                  <span className="text-white font-bold">{activeGemologist?.name} ({activeGemologist?.title})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-gold-200/50 uppercase">Date & Time:</span>
                  <span className="text-luxury-gold-300 font-bold font-mono">{selectedDate.formatted} @ {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-gold-200/50 uppercase">Type:</span>
                  <span className="text-white font-bold">{activeConsultation?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-gold-200/50 uppercase">Location:</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Video className="h-3.5 w-3.5 text-luxury-gold-400" /> Virtual Video Room (Link in email)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold rounded-sm transition-colors"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => setBookingConfirmed(false)}
                  className="px-8 py-3.5 bg-transparent border border-luxury-gold-900/20 hover:border-luxury-gold-500/40 text-luxury-gold-200 hover:text-white text-xs uppercase tracking-widest font-bold rounded-sm transition-colors"
                >
                  Book Another Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
