'use client';

import React, { useState, useMemo } from 'react';
import { StoreSection, StoreProduct, StoreVariant, CartItem } from '@/types/domain.types';
import { CommercialHero } from './components/CommercialHero';
import { HeightGuideSection } from './components/HeightGuideSection';
import { CollectionSection } from './components/CollectionSection';
import { BrandDifferenceSection } from './components/BrandDifferenceSection';
import { ShowroomSection } from './components/ShowroomSection';
import { CommercialFooter } from './components/CommercialFooter';
import { CartDrawer } from '@/frontend/components/CartDrawer';
import { GuestCheckoutModal } from '@/frontend/components/GuestCheckoutModal';
import { ProductDetailModal } from '@/frontend/components/ProductDetailModal';
import { WhatsAppFloatingButton } from '@/frontend/components/WhatsAppFloatingButton';
import { SearchModal } from '@/frontend/components/SearchModal';

export function StorefrontView({ initialSections }: { initialSections: StoreSection[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<StoreProduct | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const allProducts = useMemo(
    () => initialSections.flatMap((sec) => sec.products),
    [initialSections]
  );

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const handleAddToCart = (product: StoreProduct, variant?: StoreVariant) => {
    const selectedVariant = variant || product.variants.find((v) => v.isDefault) || product.variants[0];
    const unitPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
    const imageUrl = product.images[0]?.storagePath || '/img/pino-canadiense-nevado.webp';

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === selectedVariant?.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: selectedVariant?.id,
          name: product.name,
          variantLabel: selectedVariant?.label,
          unitPrice,
          quantity: 1,
          imageUrl,
        },
      ];
    });
  };

  const handleAddSimpleToCart = (name: string, price: number, imageUrl: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === name);
      if (existing) {
        return prev.map((item) =>
          item.name === name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: Math.floor(Math.random() * 100000),
          name,
          unitPrice: price,
          quantity: 1,
          imageUrl,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: StoreProduct, variant?: StoreVariant) => {
    handleAddToCart(product, variant);
    setIsCheckoutOpen(true);
  };

  const handleRemoveFromCart = (productId: number, variantId?: number) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const handleUpdateQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
      )
    );
  };

  const handleScrollToCollection = () => {
    const el = document.getElementById('coleccion');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#121417] text-white min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 lg:p-7 antialiased selection:bg-brand-gold selection:text-black">
      {/* BEGIN: Outer Frame Presentation Context */}
      <div className="w-full max-w-[1580px] mx-auto transition-all" data-purpose="viewport-container">
        
        {/* BEGIN: Commercial Hero Main Container */}
        <CommercialHero
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onExploreClick={handleScrollToCollection}
        />
        {/* END: Commercial Hero Main Container */}

        {/* BEGIN: Quick Features Footer Strip */}
        <div className="w-full flex flex-col space-y-16 sm:space-y-20 lg:space-y-24 mt-12 sm:mt-16 text-white">
          {/* Section 1: Calculador de Espacio */}
          <HeightGuideSection />

          {/* Section 2: Colección Dos Tradiciones */}
          <CollectionSection
            onAddToCart={handleAddSimpleToCart}
            onOpenQuickView={(item) => {
              // Convert partial to StoreProduct for modal
              const found = allProducts.find((p) => p.name.toLowerCase() === item.name?.toLowerCase());
              if (found) {
                setSelectedProductForDetail(found);
              } else {
                setSelectedProductForDetail({
                  id: item.id || 999,
                  name: item.name || '',
                  description: item.description || '',
                  basePrice: item.basePrice || 0,
                  compareAtPrice: null,
                  badgeTop: 'Colección 2026',
                  badgeBottom: null,
                  stock: 12,
                  isPublished: true,
                  sku: `ND-${item.id || 999}`,
                  sectionId: 1,
                  images: (item.images as StoreProduct['images']) || [],
                  variants: [
                    { id: 1, label: '1.80m', price: item.basePrice || 0, stock: 5, isDefault: true },
                    { id: 2, label: '2.10m', price: (item.basePrice || 0) + 120000, stock: 4, isDefault: false },
                    { id: 3, label: '2.40m', price: (item.basePrice || 0) + 250000, stock: 3, isDefault: false },
                  ],
                });
              }
            }}
          />

          {/* Section 3: La Diferencia Navidad David */}
          <BrandDifferenceSection />

          {/* Section 4: Showroom Bogotá */}
          <ShowroomSection />

          {/* Section 5: Footer Oficial */}
          <CommercialFooter />
        </div>
        {/* END: Quick Features Footer Strip */}
      </div>
      {/* END: Outer Frame Presentation Context */}

      {/* MODAL DETALLE DE PRODUCTO */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* MODAL DE BÚSQUEDA PREDICTIVA */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={allProducts}
        onSelectProduct={(prod) => {
          setIsSearchModalOpen(false);
          setSelectedProductForDetail(prod);
        }}
      />

      {/* BOTÓN FLOTANTE OFICIAL DE WHATSAPP */}
      <WhatsAppFloatingButton />

      {/* DRAWER CARRITO DE COMPRAS */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* MODAL CHECKOUT CON PASARELA BOLD */}
      {isCheckoutOpen && (
        <GuestCheckoutModal
          cart={cart}
          totalAmount={cartTotal}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccessClear={() => setCart([])}
        />
      )}
    </div>
  );
}
