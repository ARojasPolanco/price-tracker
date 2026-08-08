import { useState, useEffect } from "react";
import {
  getSalesReport,
  getIncomeReport,
  getExpensesReport,
  getInvoicesReport,
  getPendingCreditAccountsReport,
} from "../services/api";

const PERIODS = [
  { value: "diario", label: "Hoy" },
  { value: "semanal", label: "7 días" },
  { value: "quincenal", label: "15 días" },
  { value: "mensual", label: "Este mes" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [period, setPeriod] = useState("diario");
  const [salesData, setSalesData] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [invoicesData, setInvoicesData] = useState(null);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "sales":
          const sales = await getSalesReport(period);
          setSalesData(sales);
          break;
        case "income":
          const income = await getIncomeReport(period);
          setIncomeData(income);
          break;
        case "expenses":
          const expenses = await getExpensesReport(period);
          setExpensesData(expenses);
          break;
        case "invoices":
          const invoices = await getInvoicesReport();
          setInvoicesData(invoices);
          break;
        case "credit-accounts":
          const accounts = await getPendingCreditAccountsReport();
          setPendingAccounts(accounts);
          break;
      }
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al cargar reporte";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [activeTab, period]);

  const tabs = [
    { value: "sales", label: "Ventas" },
    { value: "income", label: "Ingresos" },
    { value: "expenses", label: "Gastos" },
    { value: "invoices", label: "Facturas" },
    { value: "credit-accounts", label: "Ctas Ctes" },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Reportes</h2>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.value
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selector de período (no aplica para facturas y cuentas corrientes) */}
      {activeTab !== "invoices" && activeTab !== "credit-accounts" && (
        <div className="flex gap-1 mb-4">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p.value
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      ) : (
        <>
          {/* Ventas */}
          {activeTab === "sales" && salesData && (
            <div>
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-indigo-600">Total ventas</p>
                <p className="text-3xl font-bold text-indigo-700">${salesData.total.toFixed(2)}</p>
              </div>
              {salesData.byDate.length > 0 ? (
                <div className="space-y-2">
                  {salesData.byDate.map((item) => (
                    <div key={item.date} className="bg-white rounded-lg border border-gray-100 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{new Date(item.date + "T12:00:00").toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{item.count} venta{item.count !== "1" ? "s" : ""}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800">${parseFloat(item.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">Sin ventas en este período</p>
              )}
            </div>
          )}

          {/* Ingresos */}
          {activeTab === "income" && incomeData && (
            <div>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-green-600">Total ingresos</p>
                <p className="text-3xl font-bold text-green-700">${incomeData.total.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">Ventas en efectivo/MP/DNI + cobros de cuenta corriente</p>
              </div>
              {incomeData.byDate.length > 0 ? (
                <div className="space-y-2">
                  {incomeData.byDate.map((item) => (
                    <div key={item.date} className="bg-white rounded-lg border border-gray-100 p-3 flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800">{new Date(item.date + "T12:00:00").toLocaleDateString()}</p>
                      <p className="text-sm font-bold text-green-600">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">Sin ingresos en este período</p>
              )}
            </div>
          )}

          {/* Gastos */}
          {activeTab === "expenses" && expensesData && (
            <div>
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-red-600">Total gastos</p>
                <p className="text-3xl font-bold text-red-700">${expensesData.total.toFixed(2)}</p>
              </div>
              {expensesData.byDate.length > 0 ? (
                <div className="space-y-2">
                  {expensesData.byDate.map((item) => (
                    <div key={item.date} className="bg-white rounded-lg border border-gray-100 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{new Date(item.date + "T12:00:00").toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{item.count} gasto{item.count !== "1" ? "s" : ""}</p>
                      </div>
                      <p className="text-sm font-bold text-red-600">${parseFloat(item.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">Sin gastos en este período</p>
              )}
            </div>
          )}

          {/* Facturas */}
          {activeTab === "invoices" && invoicesData && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-yellow-600">Pendiente</p>
                <p className="text-2xl font-bold text-yellow-700">${invoicesData.pending.total.toFixed(2)}</p>
                <p className="text-xs text-yellow-600">{invoicesData.pending.count} factura{invoicesData.pending.count !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600">Pagado</p>
                <p className="text-2xl font-bold text-green-700">${invoicesData.paid.total.toFixed(2)}</p>
                <p className="text-xs text-green-600">{invoicesData.paid.count} factura{invoicesData.paid.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}

          {/* Cuentas corrientes pendientes */}
          {activeTab === "credit-accounts" && (
            <div>
              {pendingAccounts.length > 0 ? (
                <div className="space-y-2">
                  {pendingAccounts.map((account) => (
                    <div key={account.id} className="bg-white rounded-lg border border-gray-100 p-3 flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800">{account.name}</p>
                      <p className="text-sm font-bold text-red-600">${parseFloat(account.balance).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="bg-red-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-red-600">Total pendiente</p>
                    <p className="text-xl font-bold text-red-700">
                      ${pendingAccounts.reduce((sum, a) => sum + parseFloat(a.balance), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">No hay cuentas corrientes pendientes</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
