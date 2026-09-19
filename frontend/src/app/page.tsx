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
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-accent-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-bold tracking-wide backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Universidad Mariano Gálvez de Guatemala • Segundo Parcial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Gestión &amp; Catálogo de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-emerald-400 to-accent-400">
              Productos
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
            Plataforma monorepo moderna con Spring Boot 3 (Java 21), PostgreSQL con Liquibase, autenticación JWT basada en roles y frontend en Next.js.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-neon-emerald transition-all hover:scale-105"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-neon-emerald transition-all hover:scale-105"
                >
                  <span>Iniciar Sesión en el Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="http://localhost:8080/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-300 border border-slate-800 font-bold text-xs transition-all hover:border-slate-700"
                >
                  <Code2 className="w-4 h-4 text-brand-400" />
                  <span>Documentación Swagger API</span>
                </a>
              </>
            )}
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-accent-400" />
                <span>Catálogo de Productos Destacados</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Explora el carrusel dinámico interactivo alimentado desde la API
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Desplazamiento automático interactivo
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-dark-900/80 border border-slate-800/80 space-y-3.5 hover:border-brand-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-accent-950 text-accent-400 border border-accent-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Seguridad &amp; Roles JWT</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Control de acceso con roles <span className="text-accent-300 font-mono font-bold">ROLE_ADMIN</span> y <span className="text-brand-300 font-mono font-bold">ROLE_USER</span>. Permisos diferenciados para consulta y mutación.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-dark-900/80 border border-slate-800/80 space-y-3.5 hover:border-brand-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-brand-950 text-brand-400 border border-brand-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">PostgreSQL &amp; Liquibase</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando tablas y semillas de datos consistentes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-dark-900/80 border border-slate-800/80 space-y-3.5 hover:border-brand-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Proxy Inverso Next.js (BFF)</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Rutas controladoras Route Handlers en Next.js (<span className="text-brand-300 font-mono font-bold">/api/...</span>) que ocultan la infraestructura directa del backend Spring Boot.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">Universidad Mariano Gálvez de Guatemala • Facultad de Ingeniería en Sistemas</p>
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
