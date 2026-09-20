"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Carousel } from "@/components/Carousel";
import { ViewProductModal } from "@/components/ProductModals";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Code2,
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAll();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("No se pudo conectar a la API del backend, usando datos por defecto:", err);
        // Fallback dummy products for initial display before backend startup
        setProducts([
          {
            id: 1,
            name: "Laptop Pro 16 Ultra",
            description: "Portátil de alto rendimiento con procesador de última generación, 32GB RAM y 1TB SSD NVMe.",
            price: 1499.99,
            stock: 15,
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            category: "Computación",
            formattedPrice: "Q1,499.99",
            inStock: true,
          },
          {
            id: 2,
            name: "Monitor Curvo UltraWide 34",
            description: "Pantalla curva IPS con resolución WQHD, tasa de refresco de 144Hz y soporte HDR400.",
            price: 649.50,
            stock: 25,
            imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
            category: "Monitores",
            formattedPrice: "Q649.50",
            inStock: true,
          },
          {
            id: 3,
            name: "Auriculares Inalámbricos Studio ANC",
            description: "Cancelación activa de ruido híbrida, audio de alta resolución y 40 horas de batería continua.",
            price: 289.00,
            stock: 40,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            category: "Audio",
            formattedPrice: "Q289.00",
            inStock: true,
          },
        ]);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  return (
    <div className="public-canvas min-h-screen flex flex-col text-slate-100 relative overflow-hidden">
      <Navbar />

      <div className="subtle-grid absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      <div className="absolute top-28 left-[8%] w-2 h-2 rounded-full bg-accent-300 shadow-[0_0_24px_8px_rgb(103_232_249_/_0.35)]" />
      <div className="absolute top-52 right-[12%] w-2.5 h-2.5 rounded-full bg-brand-300 shadow-[0_0_28px_10px_rgb(216_180_254_/_0.3)]" />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-10 lg:gap-16 min-h-[520px]">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-400/10 border border-brand-300/25 text-brand-200 text-xs font-semibold tracking-wide backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent-300" />
              <span>Universidad Mariano Gálvez • Experiencia digital 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white leading-[1.03] text-balance">
              Inventario claro.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-fuchsia-300 to-accent-300">
                Decisiones rápidas.
              </span>
            </h1>

            <p className="text-violet-100/65 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Una experiencia segura para explorar y administrar productos, con arquitectura BFF,
              autenticación robusta y control de roles en una interfaz diseñada para trabajar mejor.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-fuchsia-500 hover:from-brand-500 hover:to-accent-600 text-white font-semibold text-sm shadow-brand transition-all hover:-translate-y-1"
                >
                  <span>Acceder al Panel Privado</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-fuchsia-500 hover:from-brand-500 hover:to-accent-600 text-white font-semibold text-sm shadow-brand transition-all hover:-translate-y-1"
                  >
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="/api/docs/swagger-ui/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-violet-100 border border-white/10 hover:border-accent-300/30 font-medium text-sm backdrop-blur-sm transition-all"
                  >
                    <Code2 className="w-4 h-4 text-accent-300" />
                    <span>Explorar API</span>
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="relative max-w-xl mx-auto lg:mx-0 w-full">
            <div className="absolute -inset-6 bg-gradient-to-r from-brand-600/30 to-accent-500/20 rounded-[2.5rem] blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 sm:p-7 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-accent-400/10" />
              <div className="relative flex items-center justify-between pb-5 border-b border-white/10">
                <div>
                  <p className="text-[11px] text-accent-300 font-bold uppercase tracking-[0.18em]">Arquitectura conectada</p>
                  <p className="text-xl font-bold text-white mt-1">Control, seguridad y velocidad</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-cyan">
                  <Layers className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-3 mt-5">
                {[
                  { label: "Acceso seguro", value: "JWT + Refresh", icon: ShieldCheck },
                  { label: "Pasarela privada", value: "BFF Next.js", icon: Code2 },
                  { label: "Datos confiables", value: "PostgreSQL", icon: Database },
                  { label: "Gestión flexible", value: "Roles activos", icon: Sparkles },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-ink-950/40 p-4 transition hover:-translate-y-1 hover:border-accent-300/25 hover:bg-white/[0.07]">
                    <Icon className="w-4 h-4 text-accent-300 mb-4" />
                    <p className="text-sm font-bold text-white">{value}</p>
                    <p className="text-[11px] text-violet-200/55 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-5" id="productos-destacados">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] text-accent-300 font-bold uppercase tracking-[0.2em] mb-2">Selección del catálogo</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-300" />
                <span>Productos Destacados</span>
              </h2>
              <p className="text-sm text-violet-100/55 mt-1">
                Explora el catálogo dinámico de productos activos
              </p>
            </div>
            <span className="text-[11px] text-violet-200/50 hidden sm:inline px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
              Navegación automática
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="group p-6 rounded-3xl bg-white/[0.055] border border-white/10 space-y-4 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-brand-300/30 hover:bg-white/[0.08]">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/15 text-brand-200 border border-brand-400/20 flex items-center justify-center group-hover:shadow-brand transition-shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Seguridad &amp; Roles JWT</h3>
            <p className="text-xs text-violet-100/55 leading-relaxed">
              Control de acceso con roles <span className="text-brand-200 font-mono">ROLE_ADMIN</span> y <span className="text-accent-200 font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y mutación de inventario.
            </p>
          </div>

          <div className="group p-6 rounded-3xl bg-white/[0.055] border border-white/10 space-y-4 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent-300/30 hover:bg-white/[0.08]">
            <div className="w-11 h-11 rounded-2xl bg-accent-500/15 text-accent-200 border border-accent-400/20 flex items-center justify-center group-hover:shadow-cyan transition-shadow">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">PostgreSQL &amp; Liquibase</h3>
            <p className="text-xs text-violet-100/55 leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando la creación de tablas y semillas de datos consistentes.
            </p>
          </div>

          <div className="group p-6 rounded-3xl bg-white/[0.055] border border-white/10 space-y-4 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-fuchsia-300/30 hover:bg-white/[0.08]">
            <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/20 flex items-center justify-center group-hover:shadow-brand transition-shadow">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Arquitectura Limpia y Mappers</h3>
            <p className="text-xs text-violet-100/55 leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service e Interfaces, Mappers, DTOs) y en Frontend (DTOs, Entities, Mappers, Services).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/10 py-8 text-center text-xs text-violet-200/45">
        <p>Universidad Mariano Gálvez de Guatemala • Facultad de Ingeniería en Sistemas</p>
        <p className="mt-1">Examen Segundo Parcial • Backend Spring Boot 3 + Frontend Next.js</p>
      </footer>

      {/* View Product Modal */}
      <ViewProductModal
        product={selectedProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
}
