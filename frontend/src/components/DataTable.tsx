"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/entities/product.entity";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  PackageOpen,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  products,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const query = searchTerm.toLowerCase();

    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(query);
      const matchDesc = p.description?.toLowerCase().includes(query);
      const matchCategory = p.category?.toLowerCase().includes(query);
      const matchPrice = p.price?.toString().includes(query) || p.formattedPrice?.toLowerCase().includes(query);
      const matchStock = p.stock?.toString().includes(query);

      return matchName || matchDesc || matchCategory || matchPrice || matchStock;
    });
  }, [products, searchTerm]);

  return (
    <div className="w-full bg-white/90 rounded-[1.75rem] shadow-panel border border-brand-100 overflow-hidden backdrop-blur-sm">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-brand-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-gradient-to-r from-brand-50 via-white to-accent-50/70">
        {/* Search Bar */}
        <div className="relative w-full lg:w-[26rem]">
          <Search className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="control-focus w-full pl-10 pr-16 py-2.5 rounded-xl border border-brand-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-brand-500 hover:text-brand-700"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Actions & Role Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto sm:justify-end">
          <span className="text-[11px] text-slate-500 font-semibold px-3 py-1.5 bg-white/70 border border-brand-100 rounded-full text-center">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>

          {/* Button Nuevo Producto - Only for ADMIN */}
          {isAdmin ? (
            <button
              onClick={onCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-accent-600 text-white text-sm font-semibold shadow-brand transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-semibold">
              <span>Modo Lectura (Usuario Estándar)</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
          <thead className="bg-gradient-to-r from-ink-950 via-brand-950 to-indigo-950 text-violet-100 text-[11px] uppercase font-bold tracking-[0.13em] border-b border-brand-800">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-4">Producto</th>
              <th scope="col" className="px-4 sm:px-6 py-4">Categoría</th>
              <th scope="col" className="px-4 sm:px-6 py-4">Precio</th>
              <th scope="col" className="px-4 sm:px-6 py-4">Inventario</th>
              <th scope="col" className="px-4 sm:px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="odd:bg-white even:bg-brand-50/25 hover:bg-accent-50/80 transition-colors group"
                >
                  {/* Name & Thumbnail */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 shrink-0 relative ring-2 ring-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                      <div className="max-w-xs sm:max-w-sm">
                        <p className="font-bold text-ink-900 line-clamp-1 group-hover:text-brand-800 transition-colors">{product.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                      <Tag className="w-3 h-3 text-brand-500" />
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-black text-brand-950">
                    {product.formattedPrice}
                  </td>

                  {/* Stock */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-50 text-accent-800 border border-accent-200">
                          <CheckCircle2 className="w-3 h-3 text-accent-600" />
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          Agotado
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Action: Ver (Available for ALL roles) */}
                      <button
                        onClick={() => onView(product)}
                        title="Ver producto en grande"
                        className="p-2 text-slate-500 hover:text-brand-700 hover:bg-brand-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300/50"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Action: Editar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          className="p-2 text-slate-500 hover:text-accent-700 hover:bg-accent-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent-300/50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Action: Eliminar (Available ONLY for ADMIN) */}
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(product)}
                          title="Eliminar producto"
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-slate-400 bg-gradient-to-b from-white to-brand-50/50">
                  <PackageOpen className="w-12 h-12 mx-auto mb-3 text-brand-300" />
                  <p className="font-semibold text-brand-950">No se encontraron productos</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTerm
                      ? `No hay coincidencias para "${searchTerm}"`
                      : "Aún no hay productos registrados en el sistema."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
