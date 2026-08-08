import { useState, useEffect } from "react";
import Login from "./components/Login";
import ProductList from "./components/ProductList";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

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

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
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
      <ProductList token={token} />
    </div>
  );
}
