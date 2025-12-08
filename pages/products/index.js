import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal confirm
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, msg: "" });

  const showToast = (msg) => {
    setToast({ open: true, msg });
    setTimeout(() => setToast({ open: false, msg: "" }), 1500);
  };

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function doDelete(id) {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    setConfirm({ open: false, id: null });
    showToast("Produk berhasil dihapus");
    loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Daftar Produk</h1>

        <Link
          href="/products/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-4 text-gray-500">Belum ada produk.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Harga</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">
                    Rp {Number(p.price || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setConfirm({ open: true, id: p.id })}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CONFIRM DELETE */}
      {confirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Hapus Produk?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Produk yang dihapus tidak bisa dikembalikan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm({ open: false, id: null })}
                className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => doDelete(confirm.id)}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIF */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow text-sm z-50">
          {toast.msg}
        </div>
      )}
    </Layout>
  );
}
