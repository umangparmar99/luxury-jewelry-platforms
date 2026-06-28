import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import '../styles/globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BeyondCarat | Luxury Bespoke Jewelry Platform',
  description:
    'Experience the epitome of luxury custom jewelry. Select from our certified loose diamond vault (GIA/IGI) and build your custom solitaire engagement rings, wedding bands, and high jewelry.',
  keywords: 'luxury jewelry, engagement rings, custom rings, GIA diamonds, diamonds, BeyondCarat, gold rings, platinum rings',
  alternates: {
    canonical: 'https://beyondcarat.com',
  },
  openGraph: {
    title: 'BeyondCarat | Luxury Custom Jewelry Platform',
    description:
      'Indulge in premium craftsmanship. Discover certified diamonds and customize rings, pendants, and bracelets.',
    url: 'https://beyondcarat.com',
    siteName: 'BeyondCarat',
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v12345/luxury_og.jpg',
        width: 1200,
        height: 630,
        alt: 'BeyondCarat Luxury Jewelry',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeyondCarat | Luxury Custom Jewelry',
    description: 'Customize rings and browse loose certified diamond index.',
    images: ['https://res.cloudinary.com/demo/image/upload/v12345/luxury_og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body
        className="font-sans antialiased flex flex-col min-h-screen bg-noise"
        style={{ backgroundColor: '#060812', color: '#F0DFC8' }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
