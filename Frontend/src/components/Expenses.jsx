import { useState, useEffect } from "react";
import { getExpenses, createExpense, deleteExpense } from "../services/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [category, setCategory] = useState("otros");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ["mercadería", "servicios", "insumos", "otros"];

  async function load() {
    try {
      const data = await getExpenses();
      setExpenses(data);
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
      await createExpense({
        amount: parseFloat(amount),
        concept,
        category,
      });
      setAmount("");
      setConcept("");
      setCategory("otros");
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al crear gasto";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este gasto?")) return;
    try {
      await deleteExpense(id);
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al eliminar";
      setError(msg);
    }
  }

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Gastos</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
          {error}
        </div>
      )}

      {/* Formulario */}
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Concepto"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Agregar gasto"}
          </button>
        </div>
      </form>

      {/* Total */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600">Total gastos</p>
        <p className="text-xl font-bold text-gray-800">${total.toFixed(2)}</p>
      </div>

      {/* Listado */}
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{expense.concept}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {expense.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800">
                  ${parseFloat(expense.amount).toFixed(2)}
                </p>
                <button
                  onClick={() => handleDelete(expense.id)}
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

      {expenses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No hay gastos registrados</p>
        </div>
      )}
    </div>
  );
}
