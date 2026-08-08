import { useState, useEffect, useRef } from "react";
import { getProducts, getCreditAccounts, createSale } from "../services/api";

export default function SaleForm() {
  const [products, setProducts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
  const [creditAccountId, setCreditAccountId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Add item form
  const [addMode, setAddMode] = useState("catalog");
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [customName, setCustomName] = useState("");
  const [customSubtotal, setCustomSubtotal] = useState("");

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const [productsData, accountsData] = await Promise.all([
          getProducts(),
          getCreditAccounts(),
        ]);
        setProducts(productsData.filter((p) => p.available));
        setCreditAccounts(accountsData);
      } catch (err) {
        const msg = typeof err.message === "string" ? err.message : "Error al cargar datos";
        setError(msg);
      }
    }
    load();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = searchText.length > 0
    ? products
        .filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()))
        .slice(0, 10)
    : [];

  function selectProduct(product) {
    setSelectedProduct(product);
    setSearchText(product.name);
    setShowDropdown(false);
    setQuantity("");
    searchRef.current?.focus();
  }

  function clearSelection() {
    setSelectedProduct(null);
    setSearchText("");
    setQuantity("");
  }

  function addItem() {
    if (addMode === "catalog") {
      if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) return;

      const qty = parseFloat(quantity);
      const unitPrice = parseFloat(selectedProduct.price);
      const subtotal = unitPrice * qty;

      setItems([
        ...items,
        {
          type: "catalog",
          productId: selectedProduct.id,
          name: selectedProduct.name,
          saleType: selectedProduct.saleType,
          quantity: qty,
          unitPrice,
          subtotal,
        },
      ]);
      clearSelection();
    } else {
      if (!customName || !customSubtotal || parseFloat(customSubtotal) <= 0) return;

      setItems([
        ...items,
        {
          type: "custom",
          customName,
          quantity: 1,
          unitPrice: parseFloat(customSubtotal),
          subtotal: parseFloat(customSubtotal),
        },
      ]);
      setCustomName("");
      setCustomSubtotal("");
    }
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Agregá al menos un producto");
      return;
    }
    if (paymentMethod === "CUENTA_CORRIENTE" && !creditAccountId) {
      setError("Seleccioná una cuenta corriente");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payload = {
        paymentMethod,
        items: items.map((item) => {
          if (item.type === "catalog") {
            return { type: "catalog", productId: item.productId, quantity: item.quantity };
          }
          return { type: "custom", customName: item.customName, subtotal: item.subtotal };
        }),
      };
      if (paymentMethod === "CUENTA_CORRIENTE" && creditAccountId) {
        payload.creditAccountId = parseInt(creditAccountId);
      }

      const sale = await createSale(payload);
      setCompletedSale(sale);
      setItems([]);
      setPaymentMethod("EFECTIVO");
      setCreditAccountId("");
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "Error al registrar la venta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function getPaymentMethodLabel(method) {
    const labels = {
      EFECTIVO: "Efectivo",
      MERCADO_PAGO: "Mercado Pago",
      CUENTA_DNI: "Cuenta DNI",
      CUENTA_CORRIENTE: "Cuenta Corriente",
    };
    return labels[method] || method;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Nueva Venta</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
          {error}
        </div>
      )}

      {/* Add item form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3">
        <div className="flex gap-1 mb-3">
          <button
            type="button"
            onClick={() => { setAddMode("catalog"); clearSelection(); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              addMode === "catalog"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Producto del catálogo
          </button>
          <button
            type="button"
            onClick={() => setAddMode("custom")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              addMode === "custom"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Producto libre (balanza)
          </button>
        </div>

        {addMode === "catalog" ? (
          <div className="space-y-2">
            {/* Búsqueda de productos */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowDropdown(true);
                    if (selectedProduct) setSelectedProduct(null);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown de resultados */}
              {showDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProduct(p)}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 active:bg-indigo-100 transition-all border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                        <span className="text-sm font-bold text-indigo-600">
                          ${parseFloat(p.price).toFixed(2)}
                          <span className="text-xs text-gray-400 ml-1">
                            {p.saleType === "kilo" ? "/kg" : "/u"}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Sin resultados */}
              {showDropdown && searchText && filteredProducts.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <p className="text-sm text-gray-500 text-center">No se encontraron productos</p>
                </div>
              )}
            </div>

            {/* Producto seleccionado + cantidad */}
            {selectedProduct && (
              <div className="bg-indigo-50 rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-800">{selectedProduct.name}</p>
                  <p className="text-xs text-indigo-600">
                    ${parseFloat(selectedProduct.price).toFixed(2)} {selectedProduct.saleType === "kilo" ? "/kg" : "/u"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                placeholder={selectedProduct?.saleType === "kilo" ? "Peso (kg)" : "Cantidad"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="0.001"
                disabled={!selectedProduct}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct || !quantity}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nombre (ej: Fiambre)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Total"
                value={customSubtotal}
                onChange={(e) => setCustomSubtotal(e.target.value)}
                min="0"
                step="0.01"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.type === "catalog" ? item.name : item.customName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.type === "catalog" && (
                      <>
                        {item.quantity} {item.saleType === "kilo" ? "kg" : "u"} × ${item.unitPrice.toFixed(2)}
                      </>
                    )}
                    {item.type === "custom" && "Producto libre"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-indigo-600">
                    ${item.subtotal.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment method and total */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="CUENTA_DNI">Cuenta DNI</option>
              <option value="CUENTA_CORRIENTE">Cuenta Corriente</option>
            </select>
          </div>

          {paymentMethod === "CUENTA_CORRIENTE" && (
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Cuenta corriente</label>
              <select
                value={creditAccountId}
                onChange={(e) => setCreditAccountId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar cuenta</option>
                {creditAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</p>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar venta"}
          </button>
        </div>
      </form>

      {/* Modal de venta completada */}
      {completedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Venta registrada</h3>
                </div>
                <button
                  onClick={() => setCompletedSale(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info de la venta */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>ID: #{completedSale.id}</span>
                  <span>{new Date(completedSale.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {getPaymentMethodLabel(completedSale.paymentMethod)}
                  </span>
                  {completedSale.CreditAccount && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {completedSale.CreditAccount.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-3">
                {completedSale.SaleItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.Product ? item.Product.name : item.customName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.Product ? (
                          <>
                            {parseFloat(item.quantity)} {item.Product.saleType === "kilo" ? "kg" : "u"} × ${parseFloat(item.unitPriceAtSale).toFixed(2)}
                          </>
                        ) : (
                          "Producto libre"
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-indigo-600">Total</p>
                <p className="text-2xl font-bold text-indigo-700">${parseFloat(completedSale.total).toFixed(2)}</p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => setCompletedSale(null)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg active:scale-98 transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
