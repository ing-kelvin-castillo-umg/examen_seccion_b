"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/entities/product.entity";
import { X, Tag, DollarSign, Layers, Calendar, Image as ImageIcon, AlertTriangle, Loader2, Pencil, Trash2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                VIEW MODAL                                  */
/* -------------------------------------------------------------------------- */

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-ivory-50 rounded-2xl shadow-xl overflow-hidden border border-ivory-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-300 bg-ivory-100/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-ivory-200 text-[#657180]">
              <Tag className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-[#172331]">Detalle del Producto</h3>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                title="Editar producto"
                aria-label="Editar producto"
                className="p-1.5 rounded-lg text-steel-500 hover:text-white hover:bg-steel-500 transition-colors"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(product);
                }}
                title="Eliminar producto"
                aria-label="Eliminar producto"
                className="p-1.5 rounded-lg text-[#657180] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Cerrar detalle"
              aria-label="Cerrar detalle"
              className="p-1.5 rounded-lg text-[#657180] hover:text-[#172331] hover:bg-ivory-200 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Large Image Preview */}
          <div className="w-full h-72 rounded-xl overflow-hidden bg-ivory-100 border border-ivory-300 relative group shadow-sm">
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
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${product.inStock ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {product.inStock ? `${product.stock} en inventario` : "Agotado"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#657180] uppercase tracking-wider">
                {product.category}
              </span>
              <h4 className="text-2xl font-black text-[#172331] mt-1">{product.name}</h4>
            </div>

            <div className="p-4 rounded-xl bg-ivory-100/50 border border-ivory-300">
              <p className="text-xs font-medium text-[#657180] mb-1">Descripción</p>
              <p className="text-sm text-[#172331] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#E4ECF5] border border-steel-100">
                <span className="text-xs text-[#344E6D] font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Precio Unitario
                </span>
                <p className="text-lg font-bold text-[#344E6D] mt-0.5">{product.formattedPrice}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Stock Disponible
                </span>
                <p className="text-lg font-bold text-emerald-900 mt-0.5">{product.stock} unidades</p>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-100/70 border border-ivory-300 col-span-2 sm:col-span-1">
                <span className="text-xs text-[#657180] font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> ID Registro
                </span>
                <p className="text-lg font-bold text-[#172331] mt-0.5">#{product.id}</p>
              </div>
            </div>
          </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-ivory-50 rounded-2xl shadow-xl overflow-hidden border border-ivory-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-300 bg-ivory-100/50">
          <h3 className="text-lg font-bold text-[#172331]">
            {mode === "create" ? "Crear Nuevo Producto" : "Editar Producto"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#657180] hover:text-[#172331] hover:bg-ivory-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172331] uppercase mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. MacBook Pro 16 M3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent text-sm bg-white text-[#172331] placeholder:text-[#657180]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172331] uppercase mb-1">
                Precio (GTQ) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent text-sm bg-white text-[#172331] placeholder:text-[#657180]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172331] uppercase mb-1">
                Stock (Unidades) *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent text-sm bg-white text-[#172331] placeholder:text-[#657180]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172331] uppercase mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent text-sm bg-white text-[#172331]"
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
            <label className="block text-xs font-semibold text-[#172331] uppercase mb-1">
              URL de Imagen (Dummy o Web)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent text-sm bg-white text-[#172331] placeholder:text-[#657180]"
            />
            <p className="text-[11px] text-[#657180] mt-1">
              Puedes pegar cualquier URL de imagen (Unsplash, imgur, etc.)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172331] uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Características destacadas del producto..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent text-sm resize-none bg-white text-[#172331] placeholder:text-[#657180]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-ivory-300 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#657180] hover:bg-ivory-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-steel-500 hover:bg-steel-600 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-ivory-50 rounded-2xl shadow-xl p-6 border border-ivory-300">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#172331] mb-2">¿Eliminar este producto?</h3>
        <p className="text-sm text-[#657180] leading-relaxed mb-6">
          Estás a punto de eliminar permanentemente <span className="font-semibold text-[#172331]">&quot;{productName}&quot;</span>. Esta acción no se puede deshacer.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[#657180] hover:bg-ivory-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Eliminar Definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
