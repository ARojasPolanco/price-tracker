import { useState, useEffect } from "react";
import { getCreditAccounts, getCreditAccountById, createCreditAccount } from "../services/api";

export default function CreditAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await getCreditAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
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
      await createCreditAccount({ name });
      setName("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetail(id) {
    try {
      const account = await getCreditAccountById(id);
      setSelectedAccount(account);
    } catch (err) {
      setError(err.message);
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
              <button
                onClick={() => handleViewDetail(account.id)}
                className="bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-200 active:scale-95 transition-all"
              >
                Ver detalle
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No hay cuentas corrientes</p>
        </div>
      )}

      {/* Detalle de cuenta seleccionada */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{selectedAccount.name}</h3>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Saldo actual</p>
                <p className={`text-2xl font-bold ${
                  parseFloat(selectedAccount.balance) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${parseFloat(selectedAccount.balance).toFixed(2)}
                </p>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">Movimientos pendientes</h4>
              {selectedAccount.CreditAccountItems && selectedAccount.CreditAccountItems.length > 0 ? (
                <div className="space-y-2">
                  {selectedAccount.CreditAccountItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          ${parseFloat(item.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin movimientos pendientes</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
