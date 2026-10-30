'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StoreProduct } from '@/types/domain.types';
import { Search, X, TreePine, ArrowRight } from 'lucide-react';
import { formatCOPWithCode } from '@/frontend/shared/formatters';
import { OFFICIAL_ASSETS } from '@/frontend/shared/constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StoreProduct[];
  onSelectProduct: (product: StoreProduct) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-20 p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-[#16181c] text-white rounded-2xl sm:rounded-3xl shadow-glow border border-white/10 overflow-hidden max-h-[88dvh] sm:max-h-[85vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRA DE ENTRADA */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center gap-2 sm:gap-3">
          <Search className="w-5 h-5 text-brand-gold shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar árboles por nombre, estilo (canadiense, fibra óptica)..."
            className="w-full text-base sm:text-sm outline-none text-white placeholder-stone-500 bg-transparent font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-stone-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            aria-label="Cerrar búsqueda"
            className="text-xs font-bold text-stone-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="hidden sm:inline">ESC</span>
            <X className="w-4 h-4 sm:hidden" />
          </button>
        </div>

        {/* RESULTADOS */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {searchTerm.trim() === '' ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              <TreePine className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <span>Escribe el nombre de un árbol para buscar en la colección.</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              No encontramos resultados para &quot;<strong>{searchTerm}</strong>&quot;.
            </div>
          ) : (
            searchResults.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  handleClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                    <img
                      src={prod.images[0]?.storagePath || OFFICIAL_ASSETS.TREE_TRADITIONAL}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white group-hover:text-brand-gold transition-colors">
                      {prod.name}
                    </h4>
                    <span className="text-xs text-brand-gold font-display font-semibold">
                      {formatCOPWithCode(Number(prod.basePrice))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Ver detalle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
