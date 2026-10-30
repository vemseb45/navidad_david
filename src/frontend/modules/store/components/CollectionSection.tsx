'use client';

import React, { useState } from 'react';
import { StoreProduct } from '@/types/domain.types';
import { formatCOP } from '@/frontend/shared/formatters';
import { OFFICIAL_ASSETS } from '@/frontend/shared/constants';
import { shootChristmasCoins } from '@/frontend/shared/christmasCoins';

interface CollectionSectionProps {
  onAddToCart?: (productName: string, price: number, imageUrl: string) => void;
  onOpenQuickView?: (product: Partial<StoreProduct>) => void;
}

interface TreeItem {
  id: number;
  name: string;
  isFibra: boolean;
  tag1: string;
  tag1Class: string;
  tag2: string;
  tag2Class: string;
  image: string;
  rating: string;
  reviews: string;
  description: string;
  sizes: string;
  priceNum: number;
  waText: string;
}

export function CollectionSection({ onAddToCart, onOpenQuickView }: CollectionSectionProps) {
  const [filter, setFilter] = useState<'all' | 'fibra'>('all');

  const trees: TreeItem[] = [
    {
      id: 1,
      name: 'Pino Canadiense Frondoso',
      isFibra: false,
      tag1: 'Más Vendido',
      tag1Class: 'bg-brand-gold text-black text-[11px] font-bold px-2.5 py-1 rounded-full shadow',
      tag2: 'Follaje PE/PVC Ultra Denso',
      tag2Class: 'bg-black/60 backdrop-blur-md text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10',
      image: OFFICIAL_ASSETS.TREE_TRADITIONAL,
      rating: '4.9',
      reviews: '142',
      description: 'Silueta robusta de inspiración montañosa con ramas de memoria flexible y 1.200 puntas.',
      sizes: '1.80m / 2.10m / 2.40m',
      priceNum: 620000,
      waText: 'Hola, deseo comprar el Pino Canadiense Frondoso',
    },
    {
      id: 2,
      name: 'Starlight Fibra Óptica Glow',
      isFibra: true,
      tag1: 'Micro-LED Estelar',
      tag1Class: 'bg-emerald-500 text-black text-[11px] font-bold px-2.5 py-1 rounded-full shadow',
      tag2: 'Brillo Frío/Cálido Switch',
      tag2Class: 'bg-black/60 backdrop-blur-md text-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/20',
      image: OFFICIAL_ASSETS.TREE_FIBER,
      rating: '5.0',
      reviews: '89',
      description: 'Puntas con filamentos lumínicos destellantes. Olvídate de enredar extensiones tradicionales.',
      sizes: '1.80m / 2.10m',
      priceNum: 780000,
      waText: 'Hola, deseo adquirir el Starlight Fibra Optica',
    },
    {
      id: 3,
      name: 'Nevado Alpino Royal',
      isFibra: false,
      tag1: 'Nieve Flocada',
      tag1Class: 'bg-white/20 backdrop-blur-md text-stone-100 text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20',
      tag2: 'Textura Algodón',
      tag2Class: 'bg-black/60 backdrop-blur-md text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10',
      image: OFFICIAL_ASSETS.TREE_TRADITIONAL,
      rating: '4.8',
      reviews: '64',
      description: 'Efecto nieve aterciopelada no volátil. Ramos con textura real y soporte metálico antideslizante.',
      sizes: '2.10m / 2.40m',
      priceNum: 890000,
      waText: 'Hola, deseo comprar el Nevado Alpino Royal',
    },
    {
      id: 4,
      name: 'Silueta Slim Espacios Cómodos',
      isFibra: true,
      tag1: 'Silueta Slim Apto',
      tag1Class: 'bg-stone-800 text-stone-200 text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10',
      tag2: 'Ideal Apartamento',
      tag2Class: 'bg-black/60 backdrop-blur-md text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10',
      image: OFFICIAL_ASSETS.TREE_FIBER,
      rating: '4.9',
      reviews: '53',
      description: 'Ideal para apartamentos y esquinas sin sacrificar opulencia ni densidad visual en ramas.',
      sizes: '1.60m / 1.80m / 2.00m',
      priceNum: 540000,
      waText: 'Hola, deseo comprar el Silueta Slim',
    },
  ];

  const filteredTrees = filter === 'fibra' ? trees.filter((t) => t.isFibra) : trees;

  const handleBuyClick = (item: TreeItem, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    shootChristmasCoins(e.currentTarget, () => {
      if (onAddToCart) {
        onAddToCart(item.name, item.priceNum, item.image);
      }
    });
  };

  const handleOpenQuickView = (item: TreeItem) => {
    if (!onOpenQuickView) return;
    onOpenQuickView({
      id: item.id,
      name: item.name,
      description: item.description,
      basePrice: item.priceNum,
      images: [
        {
          id: item.id,
          storagePath: item.image,
          altText: item.name,
          widthPx: 800,
          heightPx: 800,
          isPrimary: true,
        },
      ],
      variants: [],
    });
  };

  return (
    <section className="w-full scroll-mt-10" id="coleccion">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display text-white">
            Dos Tradiciones, Calidad Sin Rival
          </h2>
          <p className="text-stone-300 text-sm md:text-base mt-2 max-w-xl">
            Elige la calidez orgánica del follaje canadiense o el asombro hipnótico de las microfibras estelares
            diseñadas para perdurar décadas.
          </p>
        </div>
        <div className="flex items-center p-1.5 rounded-full bg-stone-900/90 border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-white text-black shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            Todos los Modelos
          </button>
          <button
            onClick={() => setFilter('fibra')}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer ${
              filter === 'fibra' ? 'bg-white text-black shadow-md' : 'text-stone-300 hover:text-white'
            }`}
          >
            Solo Fibra Óptica
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTrees.map((item) => (
          <div
            key={item.id}
            className={`cat-card group rounded-3xl overflow-hidden glass-card flex flex-col justify-between p-4 border transition-all duration-300 relative ${
              item.isFibra
                ? 'border-emerald-500/20 hover:border-emerald-400/60'
                : 'border-white/10 hover:border-brand-gold/50'
            }`}
          >
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5">
              <span className={item.tag1Class}>{item.tag1}</span>
              <span className={item.tag2Class}>{item.tag2}</span>
            </div>

            <div
              onClick={() => handleOpenQuickView(item)}
              className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-stone-900/90 relative mb-4 cursor-pointer"
            >
              <img
                alt={item.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                src={item.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-transparent opacity-80" />
            </div>

            <div className="flex flex-col flex-1 justify-between px-1">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3
                    onClick={() => handleOpenQuickView(item)}
                    className={`text-lg font-bold text-white transition-colors cursor-pointer ${
                      item.isFibra ? 'group-hover:text-emerald-300' : 'group-hover:text-brand-gold'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 ${
                      item.isFibra ? 'text-emerald-300' : 'text-brand-gold'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span>
                      {item.rating} ({item.reviews})
                    </span>
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div>
                <div className="text-xs text-stone-400 mb-2 font-medium flex items-center justify-between">
                  <span>Medidas disponibles:</span>
                  <span className="text-stone-300">{item.sizes}</span>
                </div>

                <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Desde</span>
                    <span className="text-xl font-bold text-white font-display">
                      {formatCOP(item.priceNum)}{' '}
                      <span className="text-xs font-normal text-stone-300">COP</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleBuyClick(item, e)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs active:scale-95 transition-all shadow-md cursor-pointer bg-white text-stone-950 hover:bg-stone-100"
                  >
                    <span className="material-symbols-outlined text-[16px] text-stone-950">shopping_bag</span>
                    <span>Comprar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
