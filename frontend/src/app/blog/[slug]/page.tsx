'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Bookmark, Share2 } from 'lucide-react';

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
  content: string;
  summary: string | null;
  authorName: string;
  imageUrl: string | null;
  publishedAt: string | null;
}

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchBlogDetails();
    }
  }, [slug]);

  const fetchBlogDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/blogs/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setBlog(data.data);
      } else {
        setError(data.message || 'Article details not found.');
      }
    } catch {
      setError('Connection failure.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center flex-col gap-3" style={{ backgroundColor: S.void, color: S.cream }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: S.rose }} />
        <p className="font-sans text-[9px] uppercase tracking-widest opacity-60">Consulting Manuscripts...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center" style={{ backgroundColor: S.void, color: S.cream }}>
        <div className="max-w-md w-full text-center p-8 border rounded-sm" style={{ borderColor: 'rgba(220,60,60,0.2)', background: 'rgba(220,60,60,0.03)' }}>
          <h2 className="font-serif text-2xl font-bold text-red-400 mb-2">Retrieval Error</h2>
          <p className="text-xs text-creamDim mb-6">{error || 'Article details not found.'}</p>
          <Link href="/blog" className="px-6 py-2.5 bg-gradient-rose-gold text-white text-xs uppercase tracking-widest font-bold font-sans inline-block rounded-sm">
            Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        
        {/* --- BACK BUTTON & NAV --- */}
        <div className="mb-10">
          <Link
            href="/blog"
            className="font-sans text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 transition-colors duration-200"
            style={{ color: S.rose }}
          >
            <ArrowLeft className="h-3 w-3" /> Back to Chronicle
          </Link>
        </div>

        {/* --- HEADER --- */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: S.rose }}>
              Editorial ✦ {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}
            </span>
            <div className="flex gap-2">
              <button className="p-2 rounded-sm" style={{ background: 'rgba(212, 175, 55,0.05)', border: S.borderFaint }} aria-label="Share">
                <Share2 className="h-3.5 w-3.5" style={{ color: S.rose }} />
              </button>
            </div>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-light leading-tight">
            {blog.title}
          </h1>
          <p className="font-sans text-xs uppercase tracking-wider" style={{ color: S.creamDim }}>
            Written by {blog.authorName}
          </p>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
        </div>

        {/* --- HERO IMAGE --- */}
        {blog.imageUrl && (
          <div className="relative h-96 w-full rounded-sm overflow-hidden mb-12" style={{ border: S.borderFaint }}>
            <Image
              src={blog.imageUrl}
              alt={blog.title}
              fill
              className="object-cover brightness-75 saturate-[0.8]"
            />
          </div>
        )}

        {/* --- CONTENT BODY --- */}
        <div className="prose prose-invert max-w-none text-xs md:text-sm leading-relaxed space-y-6" style={{ color: S.creamDim }}>
          {blog.summary && (
            <p className="font-serif text-sm md:text-base font-light italic leading-relaxed text-cream border-l-2 pl-4 mb-8" style={{ borderColor: S.rose }}>
              {blog.summary}
            </p>
          )}
          {blog.content.split('\n\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

      </div>
    </div>
  );
}
