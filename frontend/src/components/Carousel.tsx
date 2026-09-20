"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/product.entity";
import { ChevronLeft, ChevronRight, Tag, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface CarouselProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Carousel: React.FC<CarouselProps> = ({ products, onSelectProduct }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (isHovered || products.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, nextSlide, products.length]);

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-violet-200/60 p-8 backdrop-blur-sm">
        <Sparkles className="w-12 h-12 mb-3 text-brand-300 animate-pulse" />
        <p className="text-base font-medium">Cargando catálogo de productos...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-950 via-brand-950 to-indigo-950 text-white shadow-[0_35px_90px_-38px_rgb(126_34_206_/_0.7)] border border-brand-300/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative background glow */}
      <div className="subtle-grid absolute inset-0 opacity-50 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-5 right-6 text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200/40 hidden sm:block">
        Curaduría UMG • {String(currentIndex + 1).padStart(2, "0")}
      </div>

      {/* Slide Content */}
      <div className="relative min-h-[500px] sm:min-h-[460px] grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-8">
        {/* Text Info (Left) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-400/10 text-accent-200 border border-accent-300/25 backdrop-blur-sm">
              <Tag className="w-3.5 h-3.5" />
              {currentProduct.category}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${currentProduct.inStock ? "bg-teal-400/10 text-teal-200 border border-teal-300/25" : "bg-rose-500/20 text-rose-200 border border-rose-400/30"}`}>
              {currentProduct.inStock ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> {currentProduct.stock} disponibles
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Agotado
                </>
              )}
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white line-clamp-2">
            {currentProduct.name}
          </h3>

          <p className="text-violet-100/65 text-sm sm:text-base leading-relaxed line-clamp-3">
            {currentProduct.description}
          </p>

          <div className="pt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-fuchsia-300 to-accent-300">
              {currentProduct.formattedPrice}
            </span>
            <span className="text-xs text-violet-200/45 uppercase tracking-wider">Precio sugerido</span>
          </div>

          {onSelectProduct && (
            <div className="pt-2">
              <button
                onClick={() => onSelectProduct(currentProduct)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold text-sm shadow-brand transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Ver Detalle del Producto</span>
              </button>
            </div>
          )}
        </div>

        {/* Image Preview (Right) */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          <div className="w-full max-w-md h-64 sm:h-80 relative rounded-3xl overflow-hidden shadow-2xl border border-accent-200/20 ring-8 ring-white/[0.035] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                // Fallback on broken image
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-accent-900/10 pointer-events-none" />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-ink-950/65 border border-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-accent-200">
              Colección destacada
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Producto anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-ink-950/60 hover:bg-brand-600 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-300/60"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente producto"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-ink-950/60 hover:bg-brand-600 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-300/60"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a producto ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-gradient-to-r from-brand-300 to-accent-300 shadow-cyan"
                : "w-2.5 h-2.5 bg-white/25 hover:bg-brand-200/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
