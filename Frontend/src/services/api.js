const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

// Products
export function getProducts(search, categoryId) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("categoryId", categoryId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/products${query}`);
}

export function createProduct(data) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(id, data) {
  return request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

// Categories
export function getCategories() {
  return request("/categories");
}

export function createCategory(data) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(id, data) {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: "DELETE" });
}

// Credit Accounts
export function getCreditAccounts() {
  return request("/credit-accounts");
}

export function getCreditAccountById(id) {
  return request(`/credit-accounts/${id}`);
}

export function createCreditAccount(data) {
  return request("/credit-accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getClosure(id) {
  return request(`/credit-accounts/${id}/closure`);
}

export function settleCreditAccount(id) {
  return request(`/credit-accounts/${id}/settle`, {
    method: "POST",
  });
}

// Sales
export function getSales() {
  return request("/sales");
}

export function getSaleById(id) {
  return request(`/sales/${id}`);
}

export function createSale(data) {
  return request("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Expenses
export function getExpenses() {
  return request("/expenses");
}

export function createExpense(data) {
  return request("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: "DELETE" });
}

// Invoices
export function getInvoices() {
  return request("/invoices");
}

export function createInvoice(data) {
  return request("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function markInvoiceAsPaid(id) {
  return request(`/invoices/${id}/pay`, {
    method: "PATCH",
  });
}

export function deleteInvoice(id) {
  return request(`/invoices/${id}`, { method: "DELETE" });
}

// Reports
export function getSalesReport(period, startDate, endDate) {
  const params = new URLSearchParams();
  if (period) params.set("period", period);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/reports/sales${query}`);
}

export function getIncomeReport(period, startDate, endDate) {
  const params = new URLSearchParams();
  if (period) params.set("period", period);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/reports/income${query}`);
}

export function getExpensesReport(period, startDate, endDate) {
  const params = new URLSearchParams();
  if (period) params.set("period", period);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/reports/expenses${query}`);
}

export function getInvoicesReport() {
  return request("/reports/invoices");
}

export function getPendingCreditAccountsReport() {
  return request("/reports/credit-accounts-pending");
}
