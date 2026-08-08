import { useState, useEffect } from "react";
import { getCreditAccounts, getClosure, createCreditAccount, settleCreditAccount } from "../services/api";

export default function CreditAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [closureData, setClosureData] = useState(null);
  const [showSettleConfirm, setShowSettleConfirm] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await getCreditAccounts();
      setAccounts(data);
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
    setSuccess(null);
    setLoading(true);
    try {
      await createCreditAccount({ name });
      setName("");
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al crear cuenta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewClosure(id) {
    try {
      const data = await getClosure(id);
      setClosureData(data);
      setShowSettleConfirm(false);
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al cargar cierre";
      setError(msg);
    }
  }

  async function handleSettle() {
    if (!closureData) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await settleCreditAccount(closureData.id);
      setSuccess(`Cuenta de ${closureData.name} saldada correctamente`);
      setClosureData(null);
      setShowSettleConfirm(false);
      load();
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al saldar cuenta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Cuentas Corrientes</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-3 text-xs">
          {success}
        </div>
      )}

      {/* Formulario crear cuenta */}
      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre de la persona"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "..." : "Crear"}
          </button>
        </div>
      </form>

      {/* Listado de cuentas */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 text-sm">{account.name}</h3>
                <p className={`font-bold text-sm ${
                  parseFloat(account.balance) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  Saldo: ${parseFloat(account.balance).toFixed(2)}
                </p>
              </div>
              {parseFloat(account.balance) > 0 && (
                <button
                  onClick={() => handleViewClosure(account.id)}
                  className="bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-200 active:scale-95 transition-all"
                >
                  Ver cierre
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No hay cuentas corrientes</p>
        </div>
      )}

      {/* Modal de cierre */}
      {closureData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{closureData.name}</h3>
                <button
                  onClick={() => { setClosureData(null); setShowSettleConfirm(false); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Saldo */}
              <div className="bg-red-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-600">Saldo pendiente</p>
                <p className="text-2xl font-bold text-red-700">
                  ${parseFloat(closureData.balance).toFixed(2)}
                </p>
              </div>

              {/* Items pendientes */}
              <h4 className="text-sm font-medium text-gray-700 mb-2">Movimientos pendientes</h4>
              {closureData.items && closureData.items.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {closureData.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          ${parseFloat(item.amount).toFixed(2)}
                        </p>
                      </div>
                      {item.Sale && item.Sale.SaleItems && (
                        <div className="space-y-1">
                          {item.Sale.SaleItems.map((si) => (
                            <div key={si.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                {si.Product ? si.Product.name : si.customName}
                                {si.Product && (
                                  <span className="text-gray-400 ml-1">
                                    ({parseFloat(si.quantity)} {si.Product.saleType === "kilo" ? "kg" : "u"})
                                  </span>
                                )}
                              </span>
                              <span className="text-gray-700 font-medium">
                                ${parseFloat(si.subtotal).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">Sin movimientos pendientes</p>
              )}

              {/* Confirmación de pago */}
              {showSettleConfirm ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    ¿Confirmar pago de ${parseFloat(closureData.balance).toFixed(2)}?
                  </p>
                  <p className="text-xs text-yellow-700 mb-3">
                    Esta acción archivará todos los movimientos pendientes y el saldo quedará en $0.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSettle}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? "Procesando..." : "Confirmar pago"}
                    </button>
                    <button
                      onClick={() => setShowSettleConfirm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSettleConfirm(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200"
                >
                  Marcar como pagada
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
