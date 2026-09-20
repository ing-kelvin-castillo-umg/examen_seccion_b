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
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-line bg-white">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-brand-50/70 lg:block" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold tracking-wide text-brand-800">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Plataforma académica de inventario</span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-brand-950 sm:text-5xl lg:text-6xl">
                Gestión de productos,
                <span className="block text-brand-600">clara y centralizada.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Consulta el catálogo institucional y administra el inventario desde una experiencia segura, ordenada y accesible para cada rol.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={isAuthenticated ? "/dashboard/products" : "/login"}
                  className="ui-btn-primary px-6 py-3"
                >
                  <span>{isAuthenticated ? "Ir al panel de productos" : "Ingresar al sistema"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-btn-secondary px-6 py-3"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Documentación de la API</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full rounded-3xl bg-brand-950 p-6 text-white shadow-panel sm:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Sistema integrado</p>
                    <h2 className="mt-1 text-xl font-bold">Catálogo e inventario</h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-200">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    [ShieldCheck, "Acceso por roles", "Permisos diferenciados para administración y consulta."],
                    [Database, "Información consistente", "Persistencia y control de cambios sobre el inventario."],
                    [Zap, "Operación ágil", "Búsqueda, detalle y mantenimiento desde una sola interfaz."],
                  ].map(([Icon, title, description]) => {
                    const FeatureIcon = Icon as typeof ShieldCheck;
                    return (
                      <div key={title as string} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <FeatureIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                        <div>
                          <h3 className="text-sm font-bold">{title as string}</h3>
                          <p className="mt-1 text-xs leading-5 text-slate-300">{description as string}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                <Zap className="h-4 w-4" />
                Catálogo disponible
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-950 sm:text-3xl">Productos destacados</h2>
              <p className="mt-1 text-sm text-muted">Explora información, disponibilidad y precio de cada producto.</p>
            </div>
            <span className="hidden text-xs font-medium text-muted sm:inline">Navegación automática e interactiva</span>
          </div>

          <Carousel products={products} onSelectProduct={handleSelectProduct} />
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              [ShieldCheck, "Seguridad por roles", "Los perfiles administrador y usuario acceden únicamente a las acciones que les corresponden."],
              [Database, "Datos organizados", "El catálogo mantiene información estructurada y consistente para cada producto."],
              [Layers, "Arquitectura integrada", "Frontend, BFF y backend trabajan como una única experiencia para el usuario."],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return (
                <article key={title as string} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <FeatureIcon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-extrabold text-ink">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description as string}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="bg-brand-950 py-8 text-center text-xs text-slate-300">
        <p className="font-semibold text-white">Universidad Mariano Gálvez de Guatemala</p>
        <p className="mt-1">Sistema académico de catálogo y gestión de productos</p>
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
