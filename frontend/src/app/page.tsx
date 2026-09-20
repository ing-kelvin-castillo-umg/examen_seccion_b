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
  Cpu,
  Clock,
  Lock,
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
    <div className="min-h-screen flex flex-col bg-stoneDark-950 text-stone-100 selection:bg-sage-600 selection:text-stone-100 relative overflow-hidden">
      {/* Ambient background glow - desaturated, subtle & warm */}
      <div className="absolute top-12 left-1/4 -translate-x-1/2 w-96 h-96 bg-sage-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-36 right-1/4 translate-x-1/2 w-96 h-96 bg-clay-500/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-500/15 border border-sage-500/25 text-sage-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sage-400" />
            <span>Universidad Mariano Gálvez de Guatemala • Segundo Parcial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-100 leading-tight">
            Gestión y Catálogo de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-sage-300 to-clay-300">
              Productos
            </span>
          </h1>

          <p className="text-stone-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Plataforma monorepo de arquitectura limpia desarrollada con Spring Boot (Java 21), PostgreSQL con Liquibase, autenticación JWT con control de roles y frontend Next.js en contenedorización optimizada.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sage-600 hover:bg-sage-500 text-stone-100 font-semibold text-sm shadow-lg shadow-sage-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Acceder al Panel Privado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sage-600 hover:bg-sage-500 text-stone-100 font-semibold text-sm shadow-lg shadow-sage-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="http://localhost:8080/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stoneDark-900 hover:bg-stoneDark-850 text-stone-300 border border-stoneDark-800 font-medium text-sm transition-all"
                >
                  <Code2 className="w-4 h-4 text-stone-400" />
                  <span>Documentación Swagger API</span>
                </a>
              </>
            )}
          </div>

          {/* Quick Technical Highlights */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="p-3 rounded-xl bg-stoneDark-900/60 border border-stoneDark-800 text-left">
              <div className="flex items-center gap-1.5 text-sage-400 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Next.js BFF</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Backend URL oculta</p>
            </div>
            <div className="p-3 rounded-xl bg-stoneDark-900/60 border border-stoneDark-800 text-left">
              <div className="flex items-center gap-1.5 text-sage-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Refresh Token</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Rotación silenciosa</p>
            </div>
            <div className="p-3 rounded-xl bg-stoneDark-900/60 border border-stoneDark-800 text-left">
              <div className="flex items-center gap-1.5 text-clay-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Auto Inactividad</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Cierre centralizado</p>
            </div>
            <div className="p-3 rounded-xl bg-stoneDark-900/60 border border-stoneDark-800 text-left">
              <div className="flex items-center gap-1.5 text-stone-300 text-xs font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>PostgreSQL</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Liquibase CI/CD</p>
            </div>
          </div>
        </section>

        {/* Carousel Showcase Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-clay-400" />
                <span>Catálogo de Productos Destacados</span>
              </h2>
              <p className="text-xs text-stone-400">
                Visualización interactiva con inventario en tiempo real
              </p>
            </div>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Desplazamiento sincronizado
            </span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        {/* Architecture & Roles Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-stoneDark-900/70 border border-stoneDark-800 space-y-3 hover:border-sage-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-sage-500/15 text-sage-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100">Seguridad &amp; Roles JWT</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Control de acceso con roles <span className="text-sage-300 font-mono">ROLE_ADMIN</span> y <span className="text-clay-300 font-mono">ROLE_USER</span>. Permisos diferenciados para consulta y mutación de inventario con lista negra de tokens revocados.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stoneDark-900/70 border border-stoneDark-800 space-y-3 hover:border-clay-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-clay-500/15 text-clay-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100">PostgreSQL &amp; Liquibase</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Evolución de esquema automatizada mediante changelogs versionados, garantizando creación de tablas, restricciones de unicidad y semillas consistentes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stoneDark-900/70 border border-stoneDark-800 space-y-3 hover:border-stoneDark-700 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-stone-700/25 text-stone-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100">Arquitectura Limpia y Mappers</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Capas desacopladas en Backend (Repository, Entity, Service, Mappers, DTOs) y en Frontend (DTOs, Entities, Mappers, Services, Hooks personalizados).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stoneDark-800/80 py-8 text-center text-xs text-stone-500 relative z-10">
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
