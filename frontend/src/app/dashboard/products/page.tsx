"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/DataTable";
import {
  ViewProductModal,
  ProductFormModal,
  DeleteConfirmModal,
} from "@/components/ProductModals";
import {
  Boxes,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  PackageCheck,
  Layers,
} from "lucide-react";

export default function ProductsPage() {
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formProduct, setFormProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err: any) {
      showToast(err.message || "Error al cargar la lista de productos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // View Handler
  const handleView = (product: Product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  // Create Handler
  const handleCreate = () => {
    setFormProduct(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Edit Handler
  const handleEdit = (product: Product) => {
    setFormProduct(product);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  // Delete Handler
  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleFormSubmit = async (data: Partial<Product>) => {
    if (formMode === "create") {
      await ProductService.create(data);
      showToast("¡Producto creado exitosamente!");
    } else if (formMode === "edit" && formProduct) {
      await ProductService.update(formProduct.id, data);
      showToast("¡Producto actualizado exitosamente!");
    }
    await loadProducts();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    await ProductService.delete(deleteProduct.id);
    showToast(`El producto "${deleteProduct.name}" ha sido eliminado.`);
    await loadProducts();
  };

  const availableProducts = products.filter((product) => product.inStock).length;
  const totalUnits = products.reduce((total, product) => total + product.stock, 0);
  const outOfStockProducts = products.length - availableProducts;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-accent-50 border-accent-200 text-accent-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-accent-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-950 via-brand-950 to-indigo-950 p-6 sm:p-8 text-white shadow-brand border border-brand-300/15">
        <div className="subtle-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-accent-400/15 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-accent-300 text-[11px] font-bold uppercase tracking-[0.18em] mb-2">
              <Boxes className="w-4 h-4" />
              <span>Módulo de Inventario</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[-0.03em]">
              Gestión de Productos
            </h1>
            <p className="text-sm text-violet-100/60 mt-2 max-w-xl">
              Consulta, busca y gestiona el inventario de productos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadProducts}
              disabled={loading}
              title="Recargar listado"
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-violet-100 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-300/50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-accent-300" : ""}`} />
            </button>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-violet-100">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-brand-300" />
              ) : (
                <UserIcon className="w-4 h-4 text-accent-300" />
              )}
              <span>Rol:</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isAdmin
                    ? "bg-brand-400/20 text-brand-200"
                    : "bg-accent-400/20 text-accent-200"
                }`}
              >
                {isAdmin ? "ADMINISTRADOR" : "USUARIO"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-brand-950">{products.length}</p>
            <p className="text-xs font-medium text-slate-500">Productos registrados</p>
          </div>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-accent-100 text-accent-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-accent-900">{totalUnits}</p>
            <p className="text-xs font-medium text-slate-500">Unidades disponibles</p>
          </div>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${outOfStockProducts > 0 ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"}`}>
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{availableProducts}</p>
            <p className="text-xs font-medium text-slate-500">
              Activos · {outOfStockProducts} agotados
            </p>
          </div>
        </div>
      </section>

      {/* Main DataTable */}
      <DataTable
        products={products}
        isAdmin={isAdmin}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* View Modal */}
      <ViewProductModal
        product={viewProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      {/* Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={formProduct}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={deleteProduct?.name || ""}
      />
    </div>
  );
}
