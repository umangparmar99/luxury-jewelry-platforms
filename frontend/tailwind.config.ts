import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ── NEW ULTRA-PREMIUM PALETTE ─────────────────────────────────────
        // Deep Space Midnight (backgrounds)
        void: {
          50:  '#e7f3f3',
          100: '#c5e2e2',
          200: '#a0d0d0',
          300: '#77bdbd',
          400: '#50a7a7',
          500: '#144747',   // Primary Teal from beyondcarat
          600: '#113e3e',
          700: '#0e3333',
          800: '#0b2626',   // Deep Teal background
          900: '#081d1d',   // Ultra-deep base teal
          950: '#051212',
        },
        // Luxury Gold (primary brand accent from beyondcarat)
        rose: {
          50:  '#fcf8dd',
          100: '#f8eebb',
          200: '#f1de9a',
          300: '#e9ce79',
          400: '#dfbe58',
          500: '#d4af37',   // Luxury Gold
          600: '#bfa030',
          700: '#a68925',
          800: '#8c721c',
          900: '#6e5912',
        },
        // Warm Ivory Cream (from beyondcarat)
        cream: {
          50:  '#ffffff',
          100: '#fffcf8',
          200: '#fef8f1',   // Warm Cream
          300: '#f6ebe0',
          400: '#eddccc',
          500: '#dbbfaa',
          600: '#caa38e',
          700: '#b78772',
          800: '#9d6756',
          900: '#7e473b',
        },
        // Lilac Violet (interactive / highlight glow)
        violet: {
          50:  '#F5F2FF',
          100: '#EDE6FF',
          200: '#D9CCFF',
          300: '#C4B2FF',
          400: '#AE99FF',
          500: '#9780FF',   // Electric Violet
          600: '#7C64E8',
          700: '#624ACE',
          800: '#4A32B4',
          900: '#341C9A',
        },
        // Warm Gold (subtle accent, not dominant)
        gold: {
          50:  '#FEFDF5',
          100: '#FDF6D8',
          200: '#FBE9A0',
          300: '#F8D868',
          400: '#F0C030',
          500: '#D4A820',   // Warm brass gold
          600: '#B08B10',
          700: '#8C6E08',
          800: '#685302',
          900: '#443900',
        },
        // ShadCN system tokens (keep for lib compatibility)
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial':     'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':      'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-rose-gold':  'linear-gradient(135deg, #dfbe58 0%, #d4af37 40%, #bfa030 100%)',
        'gradient-void':       'linear-gradient(135deg, #081d1d 0%, #114747 50%, #081d1d 100%)',
        'gradient-shimmer':    'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 50%, transparent 100%)',
      },
      boxShadow: {
        'rose-glow':    '0 0 30px rgba(212,175,55,0.35), 0 0 60px rgba(212,175,55,0.15)',
        'rose-glow-sm': '0 0 12px rgba(212,175,55,0.25)',
        'violet-glow':  '0 0 30px rgba(151,128,255,0.3), 0 0 60px rgba(151,128,255,0.1)',
        'cream-glow':   '0 0 20px rgba(219,191,136,0.2)',
        'deep':         '0 25px 60px rgba(0,0,0,0.8)',
        'glass':        '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(212,175,55,0.5)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in-up':      'fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':         'shimmer 2s linear infinite',
        'float':           'float 4s ease-in-out infinite',
        'pulse-glow':      'pulse-glow 2.5s ease-in-out infinite',
        'spin-slow':       'spin-slow 20s linear infinite',
        'slide-in-left':   'slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee':         'marquee 30s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
