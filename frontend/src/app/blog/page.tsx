'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bookmark, Send, Loader2, ArrowRight } from 'lucide-react';

const S = {
  void: '#0b2626',
  rose: '#d4af37',
  cream: '#fef8f1',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212, 175, 55,0.1)',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  authorName: string;
  imageUrl: string | null;
  publishedAt: string | null;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');
  const [newsError, setNewsError] = useState('');
  const [isSubbing, setIsSubbing] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/blogs`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.data.blogs || []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubbing(true);
    setNewsSuccess('');
    setNewsError('');
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsSuccess('Thank you for subscribing to BeyondCarat Insider!');
        setNewsletterEmail('');
      } else {
        setNewsError(data.message || 'Error subscribing.');
      }
    } catch {
      setNewsError('Connection failure.');
    } finally {
      setIsSubbing(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      {/* Background orbs */}
      <div className="orb orb-rose h-[500px] w-[500px] top-[-100px] right-[-150px] opacity-20" />
      <div className="orb orb-violet h-[500px] w-[500px] bottom-[-100px] left-[-150px] opacity-15" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-4 mb-20 max-w-2xl mx-auto">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: S.rose }}>
            Brand Chronicle
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
            BeyondCarat Journal
          </h1>
          <div className="divider-rose" />
          <p className="font-sans text-xs md:text-sm uppercase tracking-wider" style={{ color: S.creamDim }}>
            Insights into gemology acquisitions, sizing standards, and bespoke ring design secrets.
          </p>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        {isLoading ? (
          <div className="flex justify-center items-center py-28 flex-col gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: S.rose }} />
            <p className="font-sans text-[9px] uppercase tracking-widest opacity-55">Unlocking Vault Journals...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-sm" style={{ borderColor: 'rgba(212, 175, 55,0.15)' }}>
            <p className="font-serif text-lg tracking-wide text-creamDim">No journal publications found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
            
            {/* Blogs list */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col rounded-sm overflow-hidden group transition-all duration-300"
                  style={{ border: S.borderFaint }}
                >
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop'}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ filter: 'brightness(0.75) saturate(0.8)' }}
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col justify-between flex-1 gap-4" style={{ background: 'rgba(13,18,40,0.3)' }}>
                    <div className="space-y-2">
                      <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: S.rose }}>
                        {post.authorName} ✦ {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'Draft'}
                      </span>
                      <h3 className="font-serif text-lg font-light group-hover:text-rose-400 transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: 'rgba(219,191,136,0.45)' }}>
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-sans text-[9px] uppercase tracking-widest font-bold inline-flex items-center gap-1.5"
                        style={{ color: S.rose }}
                      >
                        Read Article <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
        )}

        {/* --- NEWSLETTER SECTION --- */}
        <div
          className="mt-20 p-10 rounded-sm text-center relative overflow-hidden max-w-3xl mx-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(13,18,40,0.7) 0%, rgba(11, 38, 38,0.95) 100%)',
            border: S.borderFaint
          }}
        >
          <div className="max-w-md mx-auto space-y-6">
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold block" style={{ color: S.rose }}>
              The Insider Newsletter
            </span>
            <h3 className="font-serif text-2xl font-light text-cream">Join the Inner Circle</h3>
            <p className="text-xs leading-relaxed" style={{ color: S.creamDim }}>
              Register for exclusive vault drops, private diamond allocations, and notifications of blog articles.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-sm w-full"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(212, 175, 55,0.15)',
                }}
              >
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  placeholder="Enter email address..."
                  className="bg-transparent text-xs outline-none w-full placeholder:opacity-30 font-sans"
                  style={{ color: S.cream }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubbing}
                className="px-6 rounded-sm bg-gradient-rose-gold text-white font-sans text-[10px] uppercase tracking-widest font-bold flex items-center justify-center shrink-0 disabled:opacity-40"
              >
                {isSubbing ? 'Subscribing...' : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>

            {newsSuccess && <p className="text-[11px] text-emerald-400 mt-2">{newsSuccess}</p>}
            {newsError && <p className="text-[11px] text-red-400 mt-2">{newsError}</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
