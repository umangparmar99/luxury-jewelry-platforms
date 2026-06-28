import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Gem, RefreshCw, Send, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="w-full font-sans"
      style={{
        background: 'linear-gradient(180deg, rgba(6,8,18,0) 0%, #060812 8%, #060812 100%)',
        borderTop: '1px solid rgba(212,112,106,0.08)',
      }}
    >
      {/* ── VALUE PILLARS ROW ──────────────────────────────────────────── */}
      <div
        className="w-full py-12"
        style={{
          background: 'rgba(13,18,40,0.4)',
          borderBottom: '1px solid rgba(212,112,106,0.07)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Gem,
                title: 'Certified Gemstones',
                body: 'Every diamond ethically sourced and verified by GIA or IGI certifications.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure Delivery',
                body: 'Fully insured FedEx Priority in unmarked packaging directly to your door.',
              },
              {
                icon: RefreshCw,
                title: 'Lifetime Bespoke Care',
                body: 'Complimentary sizing, engraving updates, and annual ultrasonic cleaning.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-sm group transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(212,112,106,0.06)',
                }}
              >
                <div
                  className="shrink-0 h-10 w-10 rounded-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'rgba(212,112,106,0.08)',
                    border: '1px solid rgba(212,112,106,0.2)',
                  }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ width: '18px', height: '18px', color: '#D4706A' }} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold mb-1" style={{ color: '#E5CCA0' }}>
                    {title}
                  </h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(219,191,136,0.45)' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN LINKS GRID ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Brand Column */}
        <div className="flex flex-col gap-5">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <span
              className="font-serif text-2xl tracking-[0.12em] uppercase font-light"
              style={{
                background: 'linear-gradient(135deg, #DBBF88 0%, #F5E6D0 50%, #D4706A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              BeyondCarat
            </span>
          </Link>
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(219,191,136,0.45)' }}>
            Redefining luxury jewelry through modern bespoke craftsmanship — GIA certified diamonds, platinum, and gold configuration systems with ethical sourcing.
          </p>
          <div className="flex flex-col gap-2.5 text-[11px]">
            {[
              { Icon: MapPin,  text: 'Fifth Avenue, Manhattan, NY' },
              { Icon: Phone,   text: '+1 (800) 250-CARAT' },
              { Icon: Mail,    text: 'concierge@beyondcarat.com' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: '#D4706A' }} />
                <span style={{ color: 'rgba(219,191,136,0.5)' }}>{text}</span>
              </div>
            ))}
          </div>
          {/* Social */}
          <div className="flex gap-3 mt-1">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <button
                key={i}
                className="h-8 w-8 rounded-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.15)' }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: 'rgba(219,191,136,0.5)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div>
          <h5
            className="font-sans text-[10px] uppercase tracking-widest mb-6 font-semibold"
            style={{ color: '#D4706A' }}
          >
            Bespoke Services
          </h5>
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Bespoke Ring Builder',       href: '/customizer' },
              { label: 'Loose Certified Diamonds',   href: '/diamonds' },
              { label: 'Solitaire Engagement Rings', href: '/engagement' },
              { label: 'Eternal Gold Bands',         href: '/high-jewelry' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-[11px] transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  style={{ color: 'rgba(219,191,136,0.45)' }}
                >
                  <span
                    className="h-px w-0 group-hover:w-3 transition-all duration-300"
                    style={{ background: '#D4706A' }}
                  />
                  <span className="group-hover:opacity-80 transition-opacity">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h5
            className="font-sans text-[10px] uppercase tracking-widest mb-6 font-semibold"
            style={{ color: '#D4706A' }}
          >
            Concierge Support
          </h5>
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Book Gemologist Appointment', href: '/appointments' },
              { label: 'Lifetime Sizing & Fit Care',  href: '/resizing' },
              { label: 'FedEx Insured Shipping',      href: '/shipping-policy' },
              { label: 'Bespoke Order Policies',      href: '/returns' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-[11px] transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  style={{ color: 'rgba(219,191,136,0.45)' }}
                >
                  <span
                    className="h-px w-0 group-hover:w-3 transition-all duration-300"
                    style={{ background: '#D4706A' }}
                  />
                  <span className="group-hover:opacity-80 transition-opacity">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h5
            className="font-sans text-[10px] uppercase tracking-widest mb-6 font-semibold"
            style={{ color: '#D4706A' }}
          >
            The Insider
          </h5>
          <p className="text-[11px] leading-relaxed mb-5" style={{ color: 'rgba(219,191,136,0.45)' }}>
            Exclusive updates on rare diamond vault acquisitions, private showcases, and VIP events.
          </p>
          <form className="flex flex-col gap-2">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-sm"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(212,112,106,0.12)',
              }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="bg-transparent text-[11px] outline-none w-full placeholder:opacity-40 font-sans"
                style={{ color: '#F0DFC8' }}
                required
              />
              <button
                type="submit"
                className="shrink-0 transition-all duration-200 hover:scale-110"
                style={{ color: '#D4706A' }}
                aria-label="Subscribe"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(219,191,136,0.25)' }}>
              No spam. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>

      {/* ── BOTTOM BAR ─────────────────────────────────────────────────── */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(212,112,106,0.07)' }}
      >
        <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.25)' }}>
          © 2026 BeyondCarat Private Ltd. All Rights Reserved.
        </p>
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-wider">
          <span style={{ color: 'rgba(219,191,136,0.2)' }}>Secure Payments via</span>
          {['Stripe', 'Razorpay'].map((p, i) => (
            <React.Fragment key={p}>
              <span
                className="font-semibold px-2 py-0.5 rounded-sm"
                style={{ color: 'rgba(219,191,136,0.45)', background: 'rgba(212,112,106,0.06)', border: '1px solid rgba(212,112,106,0.1)' }}
              >
                {p}
              </span>
              {i < 1 && <span style={{ color: 'rgba(212,112,106,0.3)' }}>|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}
