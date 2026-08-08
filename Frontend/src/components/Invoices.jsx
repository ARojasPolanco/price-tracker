import { useState, useEffect } from "react";
import { getInvoices, createInvoice, markInvoiceAsPaid, deleteInvoice } from "../services/api";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [amount, setAmount] = useState("");
  const [supplier, setSupplier] = useState("");
  const [concept, setConcept] = useState("");
  const [category, setCategory] = useState("otros");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const categories = ["mercadería", "servicios", "insumos", "otros"];

  async function load() {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al cargar datos";
      setError(msg);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createInvoice({
        amount: parseFloat(amount),
        supplier,
        concept,
        category,
        invoiceNumber: invoiceNumber || undefined,
      });
      setAmount("");
      setSupplier("");
      setConcept("");
      setCategory("otros");
      setInvoiceNumber("");
      setShowForm(false);
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al crear factura";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsPaid(id) {
    if (!confirm("¿Marcar esta factura como pagada?")) return;
    try {
      await markInvoiceAsPaid(id);
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al marcar como pagada";
      setError(msg);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta factura?")) return;
    try {
      await deleteInvoice(id);
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al eliminar";
      setError(msg);
    }
  }

  const pendingInvoices = invoices.filter((i) => i.status === "PENDIENTE");
  const paidInvoices = invoices.filter((i) => i.status === "PAGADA");
  const totalPending = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalPaid = paidInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Facturas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-200 active:scale-95 transition-all"
        >
          {showForm ? "Cancelar" : "+ Nueva"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-28 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Proveedor"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <input
              type="text"
              placeholder="Concepto"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nº Factura (opcional)"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Crear factura"}
            </button>
          </div>
        </form>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-600">Pendiente</p>
          <p className="text-lg font-bold text-red-700">${totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600">Pagado</p>
          <p className="text-lg font-bold text-green-700">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

      {/* Pendientes */}
      {pendingInvoices.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Pendientes</h3>
          <div className="space-y-2">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-xl shadow-sm border border-red-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{invoice.supplier}</p>
                  <p className="text-sm font-bold text-red-600">${parseFloat(invoice.amount).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-600 mb-2">{invoice.concept}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {invoice.category}
                    </span>
                    {invoice.invoiceNumber && (
                      <span className="text-xs text-gray-500">#{invoice.invoiceNumber}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMarkAsPaid(invoice.id)}
                      className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-medium hover:bg-green-200 active:scale-95 transition-all"
                    >
                      Pagar
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagadas */}
      {paidInvoices.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Pagadas</h3>
          <div className="space-y-2">
            {paidInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{invoice.supplier}</p>
                  <p className="text-sm font-bold text-green-600">${parseFloat(invoice.amount).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-600 mb-1">{invoice.concept}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    Pagada
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(invoice.paidAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No hay facturas registradas</p>
        </div>
      )}
    </div>
  );
}
