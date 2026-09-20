"use client";

import React, { useMemo, useState } from "react";
import { Product } from "@/entities/product.entity";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

interface ProductActionsProps {
  product: Product;
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="inline-flex items-center gap-1.5">
    <button
      type="button"
      onClick={() => onView(product)}
      title="Ver producto"
      aria-label={`Ver ${product.name}`}
      className="ui-icon-button h-9 w-9"
    >
      <Eye className="h-4 w-4" />
    </button>
    {isAdmin && (
      <>
        <button
          type="button"
          onClick={() => onEdit(product)}
          title="Editar producto"
          aria-label={`Editar ${product.name}`}
          className="ui-icon-button h-9 w-9 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          title="Eliminar producto"
          aria-label={`Eliminar ${product.name}`}
          className="ui-icon-button h-9 w-9 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </>
    )}
  </div>
);

const StockBadge: React.FC<{ product: Product }> = ({ product }) => (
  product.inStock ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
      <CheckCircle2 className="h-3 w-3" />
      {product.stock} unidades
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-800">
      <AlertCircle className="h-3 w-3" />
      Agotado
    </span>
  )
);

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

    return products.filter((product) => {
      const matchName = product.name?.toLowerCase().includes(query);
      const matchDescription = product.description?.toLowerCase().includes(query);
      const matchCategory = product.category?.toLowerCase().includes(query);
      const matchPrice = product.price?.toString().includes(query)
        || product.formattedPrice?.toLowerCase().includes(query);
      const matchStock = product.stock?.toString().includes(query);

      return matchName || matchDescription || matchCategory || matchPrice || matchStock;
    });
  }, [products, searchTerm]);

  return (
    <section className="ui-card w-full overflow-hidden" aria-label="Listado de productos">
      <div className="flex flex-col gap-4 border-b border-line bg-slate-50/70 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Buscar productos"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre, categoría, precio o stock"
            className="ui-input pl-10 pr-16"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted transition hover:text-brand-700"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <span className="text-xs font-semibold text-muted">
            {filteredProducts.length} de {products.length} productos
          </span>
          {isAdmin ? (
            <button type="button" onClick={onCreate} className="ui-btn-primary w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </button>
          ) : (
            <div className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
              Modo de consulta
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <>
          <div className="grid gap-3 p-4 md:hidden">
            {filteredProducts.map((product) => (
              <article key={product.id} className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-ink">{product.name}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-muted">
                      <Tag className="h-3 w-3" />
                      {product.category}
                    </span>
                    <p className="mt-2 text-lg font-black text-brand-950">{product.formattedPrice}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                  <StockBadge product={product} />
                  <ProductActions
                    product={product}
                    isAdmin={isAdmin}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-sm text-slate-600">
              <thead className="border-b border-line bg-brand-950 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Producto</th>
                  <th scope="col" className="px-6 py-4">Categoría</th>
                  <th scope="col" className="px-6 py-4">Precio</th>
                  <th scope="col" className="px-6 py-4">Inventario</th>
                  <th scope="col" className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="group transition-colors hover:bg-brand-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(event) => {
                              (event.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        </div>
                        <div className="max-w-sm">
                          <p className="line-clamp-1 font-extrabold text-ink">{product.name}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full border border-line bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                        <Tag className="h-3 w-3 text-brand-600" />
                        {product.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-black text-brand-950">{product.formattedPrice}</td>
                    <td className="whitespace-nowrap px-6 py-4"><StockBadge product={product} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <ProductActions
                        product={product}
                        isAdmin={isAdmin}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-6 py-16 text-center text-muted">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-400">
            <PackageOpen className="h-7 w-7" />
          </div>
          <p className="mt-4 font-extrabold text-ink">No se encontraron productos</p>
          <p className="mt-1 text-xs">
            {searchTerm ? `No hay coincidencias para "${searchTerm}"` : "Aún no hay productos registrados."}
          </p>
        </div>
      )}
    </section>
  );
};
