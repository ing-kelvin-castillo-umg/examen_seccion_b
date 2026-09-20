"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/entities/product.entity";
import { X, Tag, DollarSign, Layers, Calendar, AlertTriangle, Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                VIEW MODAL                                  */
/* -------------------------------------------------------------------------- */

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="view-product-title" className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-panel sm:max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-brand-950 px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-500/20 p-1.5 text-brand-200">
              <Tag className="w-4 h-4" />
            </span>
            <h3 id="view-product-title" className="text-lg font-bold">Detalle del producto</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-10rem)] space-y-6 overflow-y-auto p-4 sm:p-6">
          {/* Large Image Preview */}
          <div className="group relative h-52 w-full overflow-hidden rounded-2xl border border-line bg-slate-100 sm:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute top-3 right-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold text-white shadow-soft ${product.inStock ? "bg-emerald-700" : "bg-red-700"}`}>
                {product.inStock ? `${product.stock} en inventario` : "Agotado"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                {product.category}
              </span>
              <h4 className="mt-1 text-2xl font-black text-brand-950">{product.name}</h4>
            </div>

            <div className="rounded-2xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Descripción</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5">
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-700">
                  <DollarSign className="w-3.5 h-3.5" /> Precio Unitario
                </span>
                <p className="mt-0.5 text-lg font-black text-brand-950">{product.formattedPrice}</p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Stock Disponible
                </span>
                <p className="text-lg font-bold text-emerald-900 mt-0.5">{product.stock} unidades</p>
              </div>

              <div className="rounded-xl border border-line bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> ID Registro
                </span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">#{product.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-line bg-slate-50 px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="ui-btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               FORM MODAL (CREATE / EDIT)                   */
/* -------------------------------------------------------------------------- */

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  product?: Product | null;
  mode: "create" | "edit";
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  mode,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Computación");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product && mode === "edit") {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price !== undefined ? product.price : "");
      setStock(product.stock !== undefined ? product.stock : "");
      setImageUrl(product.imageUrl || "");
      setCategory(product.category || "Computación");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrl("");
      setCategory("Computación");
    }
    setError(null);
  }, [product, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setError("El stock no puede ser un número negativo.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name,
        description,
        price: numPrice,
        stock: numStock,
        imageUrl,
        category,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="product-form-title" className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-panel sm:max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-brand-950 px-5 py-4 text-white sm:px-6">
          <h3 id="product-form-title" className="text-lg font-bold">
            {mode === "create" ? "Crear nuevo producto" : "Editar producto"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto p-5 sm:p-6">
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="product-name" className="ui-label">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="product-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. MacBook Pro 16 M3"
              className="ui-input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-price" className="ui-label">
                Precio (GTQ) *
              </label>
              <input
                type="number"
                id="product-price"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="ui-input"
              />
            </div>

            <div>
              <label htmlFor="product-stock" className="ui-label">
                Stock (Unidades) *
              </label>
              <input
                type="number"
                id="product-stock"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="ui-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-category" className="ui-label">
              Categoría
            </label>
            <select
              value={category}
              id="product-category"
              onChange={(e) => setCategory(e.target.value)}
              className="ui-input"
            >
              <option value="Computación">Computación</option>
              <option value="Monitores">Monitores</option>
              <option value="Audio">Audio</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Wearables">Wearables</option>
              <option value="Redes">Redes</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-image" className="ui-label">
              URL de Imagen (Dummy o Web)
            </label>
            <input
              type="url"
              id="product-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="ui-input"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Puedes pegar cualquier URL de imagen (Unsplash, imgur, etc.)
            </p>
          </div>

          <div>
            <label htmlFor="product-description" className="ui-label">
              Descripción
            </label>
            <textarea
              rows={3}
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Características destacadas del producto..."
              className="ui-input resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="ui-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ui-btn-primary px-5"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{mode === "create" ? "Guardar Producto" : "Actualizar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              DELETE CONFIRM MODAL                          */
/* -------------------------------------------------------------------------- */

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 p-4 backdrop-blur-sm">
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-panel sm:p-7">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 id="delete-product-title" className="mb-2 text-xl font-black text-brand-950">¿Eliminar este producto?</h3>
        <p className="mb-7 text-sm leading-6 text-muted">
          Estás a punto de eliminar permanentemente <span className="font-bold text-ink">&quot;{productName}&quot;</span>. Esta acción no se puede deshacer.
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="ui-btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="ui-btn-danger px-5"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Eliminar Definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
