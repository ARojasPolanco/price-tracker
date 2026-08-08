import { useState, useEffect } from "react";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import CreditAccounts from "./components/CreditAccounts";
import SaleForm from "./components/SaleForm";
import Expenses from "./components/Expenses";
import Invoices from "./components/Invoices";
import Reports from "./components/Reports";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("products");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  function handleLogin(token, user) {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function navigateTo(viewName) {
    setView(viewName);
    setMenuOpen(false);
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user?.role === "administrador";

  const menuItems = [
    { key: "products", label: "Productos", icon: "📦" },
    { key: "new-sale", label: "Nueva Venta", icon: "🛒" },
    ...(isAdmin
      ? [
          { key: "credit-accounts", label: "Cuentas Corrientes", icon: "📋" },
          { key: "expenses", label: "Gastos", icon: "💸" },
          { key: "invoices", label: "Facturas", icon: "📄" },
          { key: "reports", label: "Reportes", icon: "📊" },
        ]
      : []),
  ];

  const currentLabel = menuItems.find((m) => m.key === view)?.label || "Menú";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {isAdmin ? (
            <>
              {/* Admin: menú hamburguesa */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-sm font-bold text-gray-800">{currentLabel}</h1>
                <p className="text-xs text-gray-500">{user.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 active:scale-95 transition-all"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              {/* Vendedor: navbar con tabs */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-lg font-bold text-gray-800">Price Tracker</h1>
                  <button
                    onClick={handleLogout}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 active:scale-95 transition-all"
                  >
                    Salir
                  </button>
                </div>
                {/* Tabs de navegación */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setView("products")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      view === "products"
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    📦 Productos
                  </button>
                  <button
                    onClick={() => setView("new-sale")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      view === "new-sale"
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    🛒 Nueva Venta
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menú hamburguesa (admin) */}
      {isAdmin && menuOpen && (
        <div className="bg-white border-b border-gray-200 shadow-md">
          <div className="max-w-md mx-auto px-4 py-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigateTo(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  view === item.key
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="max-w-md mx-auto">
        {view === "products" && <ProductList token={token} />}
        {view === "new-sale" && <SaleForm />}
        {view === "credit-accounts" && isAdmin && <CreditAccounts />}
        {view === "expenses" && isAdmin && <Expenses />}
        {view === "invoices" && isAdmin && <Invoices />}
        {view === "reports" && isAdmin && <Reports />}
      </div>
    </div>
  );
}
