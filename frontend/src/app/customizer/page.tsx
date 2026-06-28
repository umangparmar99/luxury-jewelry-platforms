'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, ArrowRight, ArrowLeft, ShieldCheck, Check, Sparkles, AlertCircle, ShoppingBag, Info, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProductMetalConfig {
  id: string;
  metalType: string;
  priceAdjustment: string | number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  basePrice: string | number;
  isCustomizable: boolean;
  metalConfigs: ProductMetalConfig[];
  variants: Array<{ imageUrls: string }>;
}

interface Diamond {
  id: string;
  shape: string;
  carat: string | number;
  color: string;
  clarity: string;
  cut: string | null;
  certificateNumber: string | null;
  price: string | number;
}

const steps = [
  { id: 1, name: 'Setting Style', desc: 'Select band silhouette' },
  { id: 2, name: 'Metal Alloy', desc: 'Select precious metal' },
  { id: 3, name: 'Match Diamond', desc: 'Pick GIA center stone' },
  { id: 4, name: 'Size & Engraving', desc: 'Bespoke details' },
  { id: 5, name: 'Review Bag', desc: 'Appraise & verify' },
];

const metalDetails: Record<string, { label: string; color: string; desc: string; textClass: string }> = {
  YELLOW_GOLD_18K: { label: '18k Yellow Gold', color: '#D4AF37', desc: 'Classic warm heirloom alloy, 75% pure gold.', textClass: 'text-yellow-500' },
  WHITE_GOLD_18K: { label: '18k White Gold', color: '#E5E4E2', desc: 'Sleek brilliant white luster finished with rhodium.', textClass: 'text-slate-300' },
  ROSE_GOLD_18K: { label: '18k Rose Gold', color: '#B76E79', desc: 'Romantic coppery hue containing copper elements.', textClass: 'text-red-300' },
  PLATINUM: { label: 'Platinum', color: '#E5E4E2', desc: 'Pure premium density, naturally white and hypoallergenic.', textClass: 'text-stone-300' },
};

const ringSizes = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

function CustomizerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Configurator States
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<Product[]>([]);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selections
  const [selectedSetting, setSelectedSetting] = useState<Product | null>(null);
  const [selectedMetal, setSelectedMetal] = useState<string>('YELLOW_GOLD_18K');
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [selectedSize, setSelectedSize] = useState<number>(6.0);
  const [engravingText, setEngravingText] = useState<string>('');

  // Toast / Actions status
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch Settings & Loose Diamonds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch customizable settings
        const settingsRes = await fetch(`${apiUrl}/catalog/products?isCustomizable=true&limit=10`);
        if (!settingsRes.ok) throw new Error('Could not load ring settings.');
        const settingsData = await settingsRes.json();
        const loadedSettings: Product[] = settingsData.data?.products || [];
        setSettings(loadedSettings);

        // Set default setting
        if (loadedSettings.length > 0) setSelectedSetting(loadedSettings[0]);

        // 2. Fetch loose diamonds
        const diamondsRes = await fetch(`${apiUrl}/catalog/diamonds?limit=30`);
        if (!diamondsRes.ok) throw new Error('Could not load certified gemstones.');
        const diamondsData = await diamondsRes.json();
        const loadedDiamonds: Diamond[] = diamondsData.data?.diamonds || [];
        setDiamonds(loadedDiamonds);

        // Check if diamondId param is preset (redirected from diamonds page)
        const presetDiamondId = searchParams.get('diamondId');
        if (presetDiamondId && loadedDiamonds.length > 0) {
          const matched = loadedDiamonds.find((d) => d.id === presetDiamondId);
          if (matched) {
            setSelectedDiamond(matched);
            setStep(3); // Jump straight to diamond confirmation step
          }
        }

        setError('');
      } catch (err: any) {
        setError(err.message || 'Error loading customizer configuration data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Pricing Calculation
  const getSettingPrice = () => {
    if (!selectedSetting) return 0;
    const base = Number(selectedSetting.basePrice);
    const adjustment = Number(
      selectedSetting.metalConfigs.find((cfg) => cfg.metalType === selectedMetal)?.priceAdjustment || 0
    );
    return base + adjustment;
  };

  const getDiamondPrice = () => {
    return selectedDiamond ? Number(selectedDiamond.price) : 0;
  };

  const getTotalPrice = () => {
    return getSettingPrice() + getDiamondPrice();
  };

  // Ring Image mapping
  const getPreviewImage = () => {
    if (!selectedSetting) return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop';
    
    // Pick image matching the metal if available in variants
    try {
      if (selectedSetting.slug === 'classic-solitaire-setting' && selectedMetal === 'PLATINUM') {
        return 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop';
      }
      if (selectedSetting.slug === 'the-sapphire-halo-ring') {
        return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';
      }
      if (selectedSetting.slug === 'classic-pave-diamond-band') {
        return 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=600&auto=format&fit=crop';
      }
    } catch {
      // Return default fallback
    }

    return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop';
  };

  // Add customized ring configuration package to cart
  const handleAddToBag = async () => {
    if (!selectedSetting) {
      showToast('Please select a setting first.');
      return;
    }
    setIsSubmitting(true);

    const payload = {
      productId: selectedSetting.id,
      quantity: 1,
      selectedMetal,
      selectedSize,
      customEngraving: engravingText || null,
      selectedGemstoneId: selectedDiamond ? selectedDiamond.id : null,
    };

    if (user) {
      try {
        const res = await fetch(`${apiUrl}/checkout/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to add bespoke config to bag.');
        }
        window.dispatchEvent(new Event('cartUpdate'));
        showToast('Bespoke customized package successfully added to your bag!');
        setTimeout(() => router.push('/cart'), 1500);
      } catch (err: any) {
        showToast(err.message || 'Error syncing with shopping cart API.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // LocalStorage Mock Cart Integration
      const cartItem = {
        productId: selectedSetting.id,
        name: `Custom ${selectedSetting.name}`,
        slug: selectedSetting.slug,
        sku: `${selectedSetting.sku}-${selectedMetal.substring(0, 3)}-${selectedSize}`,
        metal: selectedMetal,
        size: selectedSize,
        engraving: engravingText || null,
        price: getTotalPrice(),
        quantity: 1,
        image: getPreviewImage(),
        gemstoneId: selectedDiamond ? selectedDiamond.id : null,
        diamondDetails: selectedDiamond || undefined,
      };

      try {
        const existingCart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
        existingCart.push(cartItem);
        localStorage.setItem('luxury_cart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('cartUpdate'));
        showToast('Bespoke customized package successfully added to your bag!');
        setTimeout(() => router.push('/cart'), 1500);
      } catch {
        showToast('Error saving configured ring to bag.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-luxury-slate-dark flex flex-col justify-center items-center gap-4">
        <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest text-luxury-gold-500">Launching Bespoke Builder...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-luxury-slate-dark text-luxury-gold-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-luxury-slate/30 border border-luxury-gold-900/10 p-8 rounded-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-lg font-bold text-white mb-2">Builder Error</h2>
          <p className="text-xs text-luxury-gold-100/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-luxury-gold-500 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold font-sans rounded-sm hover:bg-luxury-gold-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Toast Alert popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-luxury-slate border border-luxury-gold-500/40 p-4 rounded shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <ShieldCheck className="h-5 w-5 text-luxury-gold-500 shrink-0" />
            <span className="text-xs uppercase tracking-wider text-white font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        
        {/* Step Indicator Header bar */}
        <div className="hidden md:flex justify-between items-center bg-luxury-slate/20 border border-luxury-gold-900/10 p-4 rounded-sm mb-12">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                // Prevent jumping to steps if selections not made
                if (s.id > 1 && !selectedSetting) return;
                if (s.id > 3 && !selectedDiamond) return;
                setStep(s.id);
              }}
              disabled={s.id > 1 && !selectedSetting}
              className={`flex items-center gap-3 text-left transition-opacity ${
                step === s.id
                  ? 'opacity-100'
                  : step > s.id
                  ? 'opacity-85 hover:opacity-100'
                  : 'opacity-40'
              }`}
            >
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                step === s.id
                  ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark'
                  : step > s.id
                  ? 'bg-luxury-slate border-luxury-gold-500 text-luxury-gold-400'
                  : 'bg-transparent border-luxury-gold-900/20 text-luxury-gold-200'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-white leading-none mb-1">
                  {s.name}
                </div>
                <div className="text-[8px] tracking-wider text-luxury-gold-200/50 uppercase leading-none">
                  {s.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile Step Header */}
        <div className="md:hidden bg-luxury-slate/20 border border-luxury-gold-900/10 p-4 rounded-sm mb-8 flex justify-between items-center text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-semibold font-sans">
              Step {step} of 5
            </span>
            <h2 className="font-serif text-sm font-bold text-white mt-0.5">
              {steps[step - 1].name}
            </h2>
          </div>
          <span className="text-luxury-gold-200/40 text-[10px] uppercase tracking-wider font-mono">
            {steps[step - 1].desc}
          </span>
        </div>

        {/* Builder Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Visual Live Ring Configurer Preview */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative h-[480px] w-full bg-luxury-slate/20 border border-luxury-gold-900/10 rounded-sm overflow-hidden flex items-center justify-center">
              
              {/* Dynamic metal tone glow indicator background decoration */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000"
                style={{
                  background: `radial-gradient(circle, ${
                    selectedMetal ? metalDetails[selectedMetal]?.color : '#D4AF37'
                  } 0%, transparent 70%)`,
                }}
              />

              {/* Live Preview Image */}
              <motion.img
                key={`${selectedSetting?.id || 'none'}-${selectedMetal}`}
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                src={getPreviewImage()}
                alt="Custom Ring Preview"
                className="h-96 w-96 object-cover select-none relative z-10 transition-transform duration-700"
              />

              {/* Customizable Engraving Text Overlay preview */}
              {engravingText && step >= 4 && (
                <div className="absolute bottom-12 z-20 bg-luxury-slate-dark/80 border border-luxury-gold-500/20 px-4 py-1.5 rounded-sm backdrop-blur-sm max-w-xs text-center shadow-lg">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-semibold block mb-0.5">
                    Engraving Preview
                  </span>
                  <span className="text-xs font-serif text-white font-medium tracking-wide italic">
                    "{engravingText}"
                  </span>
                </div>
              )}

              {/* Floating Spec tag */}
              <div className="absolute top-4 left-4 bg-luxury-slate-dark/50 border border-luxury-gold-900/10 backdrop-blur-sm p-3 rounded-sm text-left flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-widest text-luxury-gold-400 font-bold leading-none">
                  Bespoke Spec
                </span>
                <span className="text-[10px] font-bold text-white uppercase mt-0.5 leading-none">
                  {selectedSetting ? selectedSetting.name : 'No Setting Select'}
                </span>
                <span className="text-[9px] text-luxury-gold-200/50 mt-0.5 leading-none">
                  Metal: {metalDetails[selectedMetal]?.label}
                </span>
              </div>
            </div>

            {/* Spec summary detail footer */}
            <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-5 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-semibold">
                  Customized Specs Summary
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mt-1 text-xs text-luxury-gold-100">
                  <span className="font-bold text-white uppercase">{selectedSetting?.sku || 'N/A'}</span>
                  <span className="text-luxury-gold-200/20">|</span>
                  <span>{metalDetails[selectedMetal]?.label}</span>
                  <span className="text-luxury-gold-200/20">|</span>
                  <span>Size {selectedSize}</span>
                  {selectedDiamond && (
                    <>
                      <span className="text-luxury-gold-200/20">|</span>
                      <span className="text-luxury-gold-300 font-semibold">{selectedDiamond.carat}ct {selectedDiamond.shape}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 border-luxury-gold-900/10 pt-4 sm:pt-0 w-full sm:w-auto">
                <div className="text-[9px] uppercase tracking-widest text-luxury-gold-200/50">Total Est. Price</div>
                <div className="text-xl font-serif font-bold text-luxury-gold-300 mt-0.5">
                  ${getTotalPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Step Configuration Parameters */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              
              {/* Step 1: Choose Ring Setting Style */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif text-lg font-bold text-white">Choose Ring Band Setting</h3>
                  <p className="text-xs text-luxury-gold-100/60 leading-relaxed">
                    Select a band baseline design. Each setting is custom crafted to mount standard certified round and fancy shape diamonds.
                  </p>

                  <div className="flex flex-col gap-3 mt-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                    {settings.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedSetting(item)}
                        className={`w-full text-left p-4 border rounded-sm transition-all duration-300 flex items-center justify-between gap-4 ${
                          selectedSetting?.id === item.id
                            ? 'bg-luxury-gold-950/20 border-luxury-gold-500 shadow-lg'
                            : 'bg-transparent border-luxury-gold-900/10 hover:border-luxury-gold-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💍</span>
                          <div>
                            <h4 className="text-xs font-bold uppercase text-white">{item.name}</h4>
                            <p className="text-[10px] text-luxury-gold-200/60 leading-relaxed mt-0.5 max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-luxury-gold-300">
                            from ${Number(item.basePrice).toFixed(2)}
                          </div>
                          <span className="text-[8px] uppercase tracking-wider text-luxury-gold-400 font-mono block mt-0.5">
                            Select setting
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Metal Alloy */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif text-lg font-bold text-white">Select Metal Alloy</h3>
                  <p className="text-xs text-luxury-gold-100/60 leading-relaxed">
                    Choose from standard high-jeweler precious metals. Each alloy is alloyed for durability and shine.
                  </p>

                  <div className="flex flex-col gap-4 mt-2">
                    {Object.keys(metalDetails).map((metal) => {
                      const det = metalDetails[metal];
                      const configAdjustment = Number(
                        selectedSetting?.metalConfigs.find((cfg) => cfg.metalType === metal)?.priceAdjustment || 0
                      );

                      return (
                        <button
                          key={metal}
                          onClick={() => setSelectedMetal(metal)}
                          className={`w-full text-left p-4 border rounded-sm transition-all duration-300 flex items-center justify-between gap-4 ${
                            selectedMetal === metal
                              ? 'bg-luxury-gold-950/20 border-luxury-gold-500 shadow-lg'
                              : 'bg-transparent border-luxury-gold-900/10 hover:border-luxury-gold-500/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-6 w-6 rounded-full border border-white/20 inline-block shadow-inner"
                              style={{ backgroundColor: det.color }}
                            />
                            <div>
                              <h4 className="text-xs font-bold uppercase text-white">{det.label}</h4>
                              <p className="text-[9px] text-luxury-gold-200/60 leading-relaxed mt-0.5 max-w-xs">
                                {det.desc}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-white">
                              {configAdjustment > 0 ? `+$${configAdjustment.toFixed(2)}` : 'Included'}
                            </div>
                            <span className="text-[8px] uppercase tracking-wider text-luxury-gold-400 font-mono mt-0.5 block">
                              Select metal
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Match Certified Diamond */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold text-white">Match Certified Center Stone</h3>
                    <button
                      onClick={() => router.push(`/diamonds?shape=${selectedSetting?.slug === 'emerald-cut-marquise-setting' ? 'EMERALD' : 'ROUND'}`)}
                      className="text-[9px] uppercase tracking-widest text-luxury-gold-400 hover:text-luxury-gold-300 font-bold border-b border-luxury-gold-400/20 pb-0.5"
                    >
                      Search Vault Grid
                    </button>
                  </div>
                  <p className="text-xs text-luxury-gold-100/60 leading-relaxed">
                    Select a GIA certified loose diamond from our vault. We trade only verified, laser-inscribed center stones.
                  </p>

                  <div className="flex flex-col gap-3 mt-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {diamonds.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDiamond(d)}
                        className={`w-full text-left p-3.5 border rounded-sm transition-all duration-300 flex items-center justify-between gap-4 ${
                          selectedDiamond?.id === d.id
                            ? 'bg-luxury-gold-950/20 border-luxury-gold-500 shadow-lg'
                            : 'bg-transparent border-luxury-gold-900/10 hover:border-luxury-gold-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💎</span>
                          <div>
                            <h4 className="text-xs font-bold uppercase text-white">
                              {d.carat} Carat {d.shape} Diamond
                            </h4>
                            <div className="flex gap-2 text-[9px] text-luxury-gold-200/50 font-mono mt-0.5">
                              <span>Color: {d.color}</span>
                              <span>Clarity: {d.clarity}</span>
                              <span>Cut: {d.cut || 'EXC'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-luxury-gold-300">
                            ${Number(d.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <span className="text-[8px] uppercase tracking-wider text-luxury-gold-200/40 font-mono mt-0.5 block">
                            {selectedDiamond?.id === d.id ? 'Matched' : 'Match stone'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Size & Custom Engraving */}
              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">Choose Ring Band Size</h3>
                    <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1">
                      Choose standard US ring sizes. We provide complimentary custom resizing on all custom rings.
                    </p>
                    
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {ringSizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`py-2 rounded-sm text-xs font-mono font-bold border transition-colors ${
                            selectedSize === sz
                              ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark'
                              : 'bg-transparent border-luxury-gold-900/15 hover:border-luxury-gold-500/20 text-luxury-gold-200'
                          }`}
                        >
                          US {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-luxury-gold-900/10 pt-6">
                    <h3 className="font-serif text-lg font-bold text-white">Bespoke Inner-Band Engraving</h3>
                    <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1">
                      Enter a memorable date, name or brief message to be laser inscribed on the inside of the band. Max 30 characters.
                    </p>

                    <div className="mt-3 relative">
                      <input
                        type="text"
                        maxLength={30}
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        placeholder="e.g. Forever Yours A & M"
                        className="w-full bg-luxury-slate-dark border border-luxury-gold-900/20 rounded-sm py-3.5 px-4 text-xs text-white placeholder-luxury-gold-200/20 outline-none focus:border-luxury-gold-500 transition-colors uppercase tracking-wider"
                      />
                      <span className="absolute right-3 bottom-3.5 text-[9px] font-mono text-luxury-gold-200/40">
                        {engravingText.length}/30
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review Customized Package */}
              {step === 5 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif text-lg font-bold text-white">Appraise Custom Configuration</h3>
                  <p className="text-xs text-luxury-gold-100/60 leading-relaxed">
                    Review your configured specifications prior to manufacturing. Orders include official GIA certs.
                  </p>

                  <div className="flex flex-col gap-3.5 mt-2 bg-luxury-slate/20 border border-luxury-gold-900/10 p-5 rounded-sm text-xs">
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase">Ring Setting:</span>
                      <span className="text-white font-bold text-right">{selectedSetting?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase">Metal Alloy:</span>
                      <span className="text-white font-bold">{metalDetails[selectedMetal]?.label}</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase">Matched Gemstone:</span>
                      <span className="text-white font-bold text-right">
                        {selectedDiamond ? `${selectedDiamond.carat}ct ${selectedDiamond.shape} (GIA-${selectedDiamond.certificateNumber})` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase">Ring Band Size:</span>
                      <span className="text-white font-bold">US Size {selectedSize}</span>
                    </div>
                    {engravingText && (
                      <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                        <span className="text-luxury-gold-200/60 uppercase">Laser Engraving:</span>
                        <span className="text-white font-bold italic">"{engravingText}"</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-sm">
                      <span className="text-luxury-gold-400 font-bold uppercase tracking-wider">Total Package Price:</span>
                      <span className="text-luxury-gold-300 font-bold font-serif">
                        ${getTotalPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start mt-2 border border-luxury-gold-900/10 p-3 rounded-sm">
                    <Info className="h-4 w-4 text-luxury-gold-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-luxury-gold-100/50 leading-relaxed">
                      This item is uniquely custom crafted to order. Bespoke production takes 7-14 working days prior to fully insured courier dispatch.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons footer */}
            <div className="flex justify-between items-center border-t border-luxury-gold-900/10 pt-8 mt-8 gap-4">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className={`py-3 px-6 border border-luxury-gold-900/20 text-luxury-gold-200 text-xs uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center gap-1.5 ${
                  step === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-luxury-gold-500/40 hover:text-white'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              {step < 5 ? (
                <button
                  onClick={() => {
                    // Check configurations
                    if (step === 3 && !selectedDiamond) {
                      showToast('Please select a certified diamond to match.');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="py-3 px-8 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleAddToBag}
                  disabled={isSubmitting}
                  className={`py-3.5 px-8 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{isSubmitting ? 'Adding Bespoke Configuration...' : 'Add Bespoke Bag'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function Customizer() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-luxury-slate-dark flex justify-center items-center">
        <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomizerContent />
    </Suspense>
  );
}
