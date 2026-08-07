import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await getProducts(search);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await createProduct({ name, price: parseFloat(price) });
      setName("");
      setPrice("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(id) {
    setError(null);
    try {
      const data = {};
      if (editName) data.name = editName;
      if (editPrice) data.price = parseFloat(editPrice);
      await updateProduct(id, data);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    setError(null);
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Header compacto */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Price Tracker
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
            {error}
          </div>
        )}

        {/* Formulario compacto */}
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="$"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200"
          >
            Agregar producto
          </button>
        </form>

        {/* Buscador compacto */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Lista de productos */}
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3"
            >
              {editingId === p.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleUpdate(p.id)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 active:scale-95 transition-all"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm truncate">{p.name}</h3>
                    <p className="text-indigo-600 font-bold">
                      ${parseFloat(p.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 ml-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="bg-amber-100 text-amber-600 p-2 rounded-lg hover:bg-amber-200 active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-100 text-red-500 p-2 rounded-lg hover:bg-red-200 active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {products.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-400 text-sm">No hay productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
