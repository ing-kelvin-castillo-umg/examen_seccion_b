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
  PackageX,
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
  const outOfStockProducts = products.length - availableProducts;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-7 lg:p-10">
      {/* Toast alert */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-panel sm:left-auto sm:right-6 sm:max-w-md ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
            <Boxes className="h-4 w-4" />
            <span>Módulo de Inventario</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-brand-950 sm:text-4xl">
            Gestión de Productos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Consulta, busca y gestiona el inventario de productos en tiempo real.
          </p>
        </div>

        {/* User Role Badge & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            title="Recargar listado"
            className="ui-icon-button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-soft">
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-brand-700" />
            ) : (
              <UserIcon className="w-4 h-4 text-emerald-600" />
            )}
            <span>Rol:</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isAdmin
                  ? "bg-brand-100 text-brand-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isAdmin ? "ADMINISTRADOR" : "USUARIO"}
            </span>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumen del inventario">
        <article className="ui-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Productos</p>
            <p className="mt-1 text-2xl font-black text-brand-950">{products.length}</p>
          </div>
        </article>
        <article className="ui-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Disponibles</p>
            <p className="mt-1 text-2xl font-black text-brand-950">{availableProducts}</p>
          </div>
        </article>
        <article className="ui-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <PackageX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Sin existencias</p>
            <p className="mt-1 text-2xl font-black text-brand-950">{outOfStockProducts}</p>
          </div>
        </article>
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
