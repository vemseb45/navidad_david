'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StoreSection, StoreProduct, StoreVariant, CartItem } from '@/types/domain.types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturesBanner } from './components/FeaturesBanner';
import { Categories } from './components/Categories';
import { DynamicSectionBar } from './components/DynamicSectionBar';
import { DynamicSectionGrid } from './components/DynamicSectionGrid';
import { Footer } from './components/Footer';
import { CartDrawer } from '@/frontend/components/CartDrawer';
import { GuestCheckoutModal } from '@/frontend/components/GuestCheckoutModal';
import { ProductDetailModal } from '@/frontend/components/ProductDetailModal';
import { WhatsAppFloatingButton } from '@/frontend/components/WhatsAppFloatingButton';
import { SearchModal } from '@/frontend/components/SearchModal';

export function StorefrontView({ initialSections }: { initialSections: StoreSection[] }) {
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<StoreProduct | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const allProducts = useMemo(
    () => initialSections.flatMap((sec) => sec.products),
    [initialSections]
  );

  const totalProductsCount = useMemo(
    () => allProducts.length,
    [allProducts]
  );

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const handleAddToCart = (product: StoreProduct, variant?: StoreVariant) => {
    const selectedVariant = variant || product.variants.find((v) => v.isDefault) || product.variants[0];
    const unitPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
    const imageUrl = product.images[0]?.storagePath || '/img/cat-arboles-tradicionales.webp';

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
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      )
    );
  };

  // NAVEGACIÓN SUAVE ENTRE SECCIONES SIN OCULTAR CONTENIDO (No-Filter Navigation)
  const handleScrollToSection = (slug: string) => {
    setActiveSectionSlug(slug);
    if (slug === 'all') {
      const el = document.getElementById('catalogo') || document.getElementById('arboles-tradicionales');
      if (el) {
        const yOffset = -85;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      return;
    }

    const el = document.getElementById(slug);
    if (el) {
      const yOffset = -85;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // DETECCIÓN AUTOMÁTICA DE SECCIÓN VISIBLE MEDIANTE OBSERVER AL HACER SCROLL
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = initialSections
        .map((s) => document.getElementById(s.slug))
        .filter(Boolean) as HTMLElement[];

      const scrollPosition = window.scrollY + 140;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveSectionSlug(el.id);
          return;
        }
      }

      if (window.scrollY < 400) {
        setActiveSectionSlug('all');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialSections]);

  // TODAS LAS SECCIONES PERMANECEN SIEMPRE VISIBLES (Solo se filtran productos al escribir en el buscador)
  const visibleSections = useMemo(() => {
    return initialSections.map((sec) => ({
      ...sec,
      products: sec.products.filter((prod) =>
        searchQuery.trim() === ''
          ? true
          : prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prod.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));
  }, [initialSections, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col justify-between selection:bg-[#002718]/15 selection:text-[#002718]">
      {/* NAVBAR OFICIAL - LOGO REDIRIGE A /admin (LOGIN), SIN BOTONES DE ADMIN EXTRA */}
      <Navbar
        sections={initialSections}
        activeSectionSlug={activeSectionSlug}
        onNavigateToSection={handleScrollToSection}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      <main className="pt-16 sm:pt-20 flex-1">
        {/* HERO VISUAL DE ALTO IMPACTO */}
        <Hero
          onExploreClick={() => handleScrollToSection('arboles-tradicionales')}
        />

        {/* PILARES DE LA MARCA (Garantías, Frondosidad, Fibra Óptica, Bold) */}
        <FeaturesBanner />

        {/* GUÍA VISUAL DE COLECCIONES (DESPLAZA DIRECTAMENTE A LA SECCIÓN) */}
        <Categories onSelectCategory={handleScrollToSection} />

        {/* BARRA STICKY DE NAVEGACIÓN Y ACCESO RÁPIDO */}
        <div id="catalogo">
          <DynamicSectionBar
            sections={initialSections}
            activeSectionSlug={activeSectionSlug}
            totalProductsCount={totalProductsCount}
            onSelectSection={handleScrollToSection}
          />
        </div>

        {/* SECCIONES Y CATÁLOGO COMPLETO DE PRODUCTOS */}
        {visibleSections.every((s) => s.products.length === 0) ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-gray-400">search_off</span>
            <p className="text-base font-bold text-gray-700 mt-2">
              No encontramos productos que coincidan con &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveSectionSlug('all');
              }}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#133e2b] text-white text-xs font-bold shadow-md hover:bg-[#002718] transition-colors"
            >
              Restablecer búsqueda y ver todo el catálogo
            </button>
          </div>
        ) : (
          visibleSections.map((section, idx) => (
            <DynamicSectionGrid
              key={section.id}
              section={section}
              index={idx}
              onAddToCart={handleAddToCart}
              onOpenQuickView={(prod) => setSelectedProductForDetail(prod)}
            />
          ))
        )}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODAL DETALLE DE PRODUCTO CON ZOOM INTERACTIVO */}
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
        onSelectProduct={(prod) => setSelectedProductForDetail(prod)}
      />

      {/* BOTÓN FLOTANTE OFICIAL DE WHATSAPP CON PULSO VERDE */}
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
