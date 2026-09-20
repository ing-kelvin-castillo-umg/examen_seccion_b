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
      <div className="flex h-80 w-full flex-col items-center justify-center rounded-3xl border border-line bg-white p-8 text-muted shadow-panel">
        <Sparkles className="mb-3 h-11 w-11 animate-pulse text-brand-300" />
        <p className="text-sm font-semibold">Cargando catálogo de productos...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-brand-900 bg-brand-950 text-white shadow-panel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-brand-900/40 lg:block" />
      <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-brand-500" />

      {/* Slide Content */}
      <div className="relative grid min-h-[500px] grid-cols-1 items-center gap-8 p-6 pb-16 sm:min-h-[460px] sm:p-10 sm:pb-14 lg:grid-cols-12 lg:p-12">
        {/* Text Info (Left) */}
        <div className="z-10 flex flex-col justify-center space-y-4 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">
              <Tag className="w-3.5 h-3.5" />
              {currentProduct.category}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${currentProduct.inStock ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : "border-red-400/30 bg-red-500/15 text-red-200"}`}>
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

          <h3 className="line-clamp-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
            {currentProduct.name}
          </h3>

          <p className="line-clamp-3 text-sm leading-7 text-slate-300 sm:text-base">
            {currentProduct.description}
          </p>

          <div className="flex flex-wrap items-baseline gap-3 pt-2">
            <span className="text-3xl font-black text-brand-300 sm:text-4xl">
              {currentProduct.formattedPrice}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Precio sugerido</span>
          </div>

          {onSelectProduct && (
            <div className="pt-2">
              <button
                onClick={() => onSelectProduct(currentProduct)}
                className="ui-btn-primary bg-brand-500 px-5 hover:bg-brand-400"
              >
                <span>Ver Detalle del Producto</span>
              </button>
            </div>
          )}
        </div>

        {/* Image Preview (Right) */}
        <div className="relative flex items-center justify-center lg:col-span-6">
          <div className="group relative h-56 w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-brand-900 shadow-panel sm:h-80">
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Producto anterior"
        className="absolute bottom-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente producto"
        className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a producto ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-brand-300"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
