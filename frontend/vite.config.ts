import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Pass '' as third parameter to load all env variables without prefix checks.
  const env = loadEnv(mode, process.cwd(), '');

  let apiUrl = env.NEXT_PUBLIC_API_URL || '';
  if (!apiUrl || apiUrl.startsWith('/')) {
    apiUrl = 'http://localhost:5000/api/v1';
  }

  return {
    plugins: [react()],
    define: {
      // Define properties individually to avoid Vite double-stringifying object properties
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''),
      'process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID': JSON.stringify(env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/image': path.resolve(__dirname, './src/lib/next-image.tsx'),
        'next/link': path.resolve(__dirname, './src/lib/next-link.tsx'),
        'next/navigation': path.resolve(__dirname, './src/lib/next-navigation.tsx'),
        'next/font/google': path.resolve(__dirname, './src/lib/next-font.tsx'),
        'next/script': path.resolve(__dirname, './src/lib/next-script.tsx'),
      },
    },
    server: {
      port: 3000,
      open: false,
    },
  };
});
