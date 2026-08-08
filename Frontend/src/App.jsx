import { useState, useEffect } from "react";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import CreditAccounts from "./components/CreditAccounts";
import SaleForm from "./components/SaleForm";
import Expenses from "./components/Expenses";
import Invoices from "./components/Invoices";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("products");

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

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user?.role === "administrador";

  return (
    <div>
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{user.username}</span>
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Salir
          </button>
        </div>
        {/* Tabs de navegación */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setView("products")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              view === "products"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setView("new-sale")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              view === "new-sale"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Nueva Venta
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setView("credit-accounts")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  view === "credit-accounts"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cuentas
              </button>
              <button
                onClick={() => setView("expenses")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  view === "expenses"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setView("invoices")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  view === "invoices"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Facturas
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      {view === "products" && <ProductList token={token} />}
      {view === "new-sale" && <SaleForm />}
      {view === "credit-accounts" && isAdmin && <CreditAccounts />}
      {view === "expenses" && isAdmin && <Expenses />}
      {view === "invoices" && isAdmin && <Invoices />}
    </div>
  );
}
