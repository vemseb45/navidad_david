'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StoreProduct } from '@/types/domain.types';
import { Search, X, TreePine, ArrowRight } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-20 p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#e4e2de] overflow-hidden max-h-[88dvh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRA DE ENTRADA */}
        <div className="p-3 sm:p-4 border-b border-[#e4e2de] flex items-center gap-2 sm:gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar árboles por nombre, estilo (nevado, fibra óptica)..."
            className="w-full text-base sm:text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            aria-label="Cerrar búsqueda"
            className="text-xs font-bold text-gray-500 hover:text-black px-2.5 py-1.5 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <span className="hidden sm:inline">ESC</span>
            <X className="w-4 h-4 sm:hidden" />
          </button>
        </div>

        {/* RESULTADOS */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {searchTerm.trim() === '' ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <TreePine className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span>Escribe el nombre de un árbol o accesorio para buscar en el catálogo.</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-xs">
              No encontramos resultados para "<strong>{searchTerm}</strong>".
            </div>
          ) : (
            searchResults.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  handleClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#fbf9f5] border border-transparent hover:border-[#e4e2de] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={prod.images[0]?.storagePath || '/img/cat-arboles-tradicionales.webp'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#002718] group-hover:text-[#b90d1c] transition-colors">
                      {prod.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      ${Number(prod.basePrice).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#133e2b] opacity-0 group-hover:opacity-100 transition-opacity">
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
