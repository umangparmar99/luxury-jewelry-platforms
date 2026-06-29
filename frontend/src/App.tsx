import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './app/page';
import AboutPage from './app/about/page';
import ContactPage from './app/contact/page';
import FAQPage from './app/faq/page';
import PrivacyPolicyPage from './app/privacy-policy/page';
import TermsPage from './app/terms/page';
import BlogListPage from './app/blog/page';
import BlogDetailsPage from './app/blog/[slug]/page';
import CatalogPage from './app/catalog/page';
import ProductDetailsPage from './app/catalog/products/[slug]/page';
import CustomizerPage from './app/customizer/page';
import CartPage from './app/cart/page';
import CheckoutPage from './app/checkout/page';
import CheckoutConfirmationPage from './app/checkout/confirmation/page';
import DashboardPage from './app/dashboard/page';
import AdminPage from './app/admin/page';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import ForgotPasswordPage from './app/forgot-password/page';
import ResetPasswordPage from './app/reset-password/page';
import VerifyEmailPage from './app/verify-email/page';
import WishlistPage from './app/wishlist/page';
import DiamondsPage from './app/diamonds/page';
import EngagementPage from './app/engagement/page';
import HighJewelryPage from './app/high-jewelry/page';
import ResizingPage from './app/resizing/page';
import ReturnsPage from './app/returns/page';
import ShippingPolicyPage from './app/shipping-policy/page';
import SearchPage from './app/search/page';
import ShopPage from './app/shop/page';
import NotFoundPage from './app/not-found';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div
          className="font-sans antialiased flex flex-col min-h-screen bg-noise"
          style={{ backgroundColor: '#060812', color: '#F0DFC8' }}
        >
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailsPage />} />
              
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/products/:slug" element={<ProductDetailsPage />} />
              <Route path="/customizer" element={<CustomizerPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/confirmation" element={<CheckoutConfirmationPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/diamonds" element={<DiamondsPage />} />
              
              <Route path="/engagement" element={<EngagementPage />} />
              <Route path="/high-jewelry" element={<HighJewelryPage />} />
              <Route path="/resizing" element={<ResizingPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              
              <Route path="/search" element={<SearchPage />} />
              <Route path="/shop" element={<ShopPage />} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
