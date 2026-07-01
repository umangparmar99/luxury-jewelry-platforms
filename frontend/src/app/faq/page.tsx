'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, PhoneCall, Award } from 'lucide-react';
import Link from 'next/link';

const S = {
  void: '#0b2626',
  rose: '#d4af37',
  cream: '#fef8f1',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212, 175, 55,0.1)',
};

const faqs = [
  {
    category: 'Custom Crafting & Sizing',
    items: [
      {
        q: 'How does your Bespoke Customizer operate?',
        a: 'Our customizer allows you to select a base ring metal configuration (such as 18k Rose Gold or Platinum) and select a loose gemstone from our GIA-certified diamond vault. Once checked out, our master jewelers on Fifth Avenue construct the setting, set the claws, and engrave the inner band.'
      },
      {
        q: 'What happens if the ring size does not fit perfectly?',
        a: 'We offer complimentary lifetime resizing on all solitaire bands within 2 sizes of the original order. Simply reach out to our concierge line to generate a pre-paid insured FedEx return label.'
      },
      {
        q: 'How long does manufacturing take for customized settings?',
        a: 'Because each bespoke ring is hand-set and laser inscribed, our typical manufacturing window is 10 to 14 business days. Standard draft collections or loose gemstones ship within 48 hours.'
      }
    ]
  },
  {
    category: 'Diamond Credentials & Verification',
    items: [
      {
        q: 'Are all of your diamonds ethically sourced?',
        a: 'Yes, every gemstone in our vault is conflict-free and complies with the Kimberley Process. All diamonds are sourced through ethical mines, laser inscribed, and verified against GIA or IGI certificates.'
      },
      {
        q: 'Do rings ship with the original GIA certificate documents?',
        a: 'Absolutely. Every diamond setting or loose gemstone purchased arrives in a dedicated luxury locking box containing the original physical certificate issued by the GIA or IGI laboratory.'
      }
    ]
  },
  {
    category: 'Insured Shipping & Delivery',
    items: [
      {
        q: 'How are high-value packages shipped safely?',
        a: 'All orders over $2,000 are shipped via FedEx Priority Insured or Brink\'s Armored Valuables Delivery in completely anonymous, unmarked outer packaging. A signature is strictly required at delivery.'
      },
      {
        q: 'Do you offer international shipping?',
        a: 'Yes. BeyondCarat facilitates private insured shipping to over 45 countries, including complete customs handling and insurance calculations during checkout.'
      }
    ]
  }
];

export default function FaqPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setActiveFaq(activeFaq === key ? null : key);
  };

  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      {/* Background orbs */}
      <div className="orb orb-rose h-[450px] w-[450px] top-[-100px] left-[-150px] opacity-25" />
      <div className="orb orb-violet h-[550px] w-[550px] bottom-[-150px] right-[-100px] opacity-15" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-4 mb-20">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: S.rose }}>
            Specialist Knowledge
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
            Frequently Asked Inquiries
          </h1>
          <div className="divider-rose" />
          <p className="font-sans text-xs md:text-sm uppercase tracking-wider" style={{ color: S.creamDim }}>
            Everything you need to know about our sourcing, customization, and secure shipping.
          </p>
        </div>

        {/* --- ACCORDION CATEGORIES --- */}
        <div className="space-y-12">
          {faqs.map((cat, cIdx) => (
            <div key={cat.category} className="space-y-4">
              <span className="block font-sans text-[10px] uppercase tracking-widest font-bold" style={{ color: S.rose }}>
                {cat.category}
              </span>
              <div className="space-y-3">
                {cat.items.map((item, iIdx) => {
                  const key = `${cIdx}-${iIdx}`;
                  const isOpen = activeFaq === key;

                  return (
                    <div
                      key={item.q}
                      className="rounded-sm overflow-hidden transition-all duration-300"
                      style={{
                        background: 'rgba(13,18,40,0.4)',
                        border: S.borderFaint
                      }}
                    >
                      <button
                        onClick={() => toggleFaq(key)}
                        className="w-full px-6 py-4 flex justify-between items-center text-left gap-4"
                      >
                        <span className="font-serif text-sm font-semibold" style={{ color: '#E5CCA0' }}>
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          style={{ color: S.rose }}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div
                              className="px-6 pb-5 pt-1 text-xs leading-relaxed"
                              style={{ color: 'rgba(219,191,136,0.55)', borderTop: '1px solid rgba(212, 175, 55,0.04)' }}
                            >
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* --- CALL TO ACTION --- */}
        <div
          className="mt-20 p-8 rounded-sm text-center space-y-6"
          style={{
            background: 'linear-gradient(135deg, rgba(13,18,40,0.7) 0%, rgba(11, 38, 38,0.95) 100%)',
            border: S.borderFaint
          }}
        >
          <h3 className="font-serif text-xl font-light text-cream">Still have questions?</h3>
          <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: S.creamDim }}>
            Our concierge team is available to assist you with selection, sizing, or diamond inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact" className="btn-outline-rose flex items-center gap-2">
              <PhoneCall className="h-3 w-3" /> Connect with Concierge
            </Link>
            <Link href="/appointments" className="px-8 py-4 font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: '#E5CCA0' }}>
              <Award className="h-3.5 w-3.5" /> Book Gemologist Consultation
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
