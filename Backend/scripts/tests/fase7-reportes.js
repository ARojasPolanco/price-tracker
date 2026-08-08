import "dotenv/config";

const BASE_URL = "http://localhost:3000/api/v1";

let adminToken = null;
let vendedorToken = null;
let passed = 0;
let failed = 0;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.log(`  ✗ ${testName}`);
    failed++;
  }
}

async function login() {
  console.log("\n--- Login ---");

  const admin = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: "admin", password: "admin123" }),
  });
  adminToken = admin.data.token;
  assert(admin.status === 200, "Admin login OK");
  assert(admin.data.user.role === "administrador", "Admin role correct");

  const vendedor = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: "vendedor", password: "vendedor123" }),
  });
  vendedorToken = vendedor.data.token;
  assert(vendedor.status === 200, "Vendedor login OK");
}

async function testSalesReport() {
  console.log("\n--- Reporte de Ventas ---");

  // Admin can access
  const res = await request("/reports/sales?period=diario");
  assert(res.status === 200, "Admin puede acceder a reporte de ventas");
  assert(res.data.hasOwnProperty("total"), "Respuesta tiene campo total");
  assert(res.data.hasOwnProperty("byDate"), "Respuesta tiene campo byDate");
  assert(Array.isArray(res.data.byDate), "byDate es un array");

  // Vendedor cannot access
  const resVendedor = await request("/reports/sales?period=diario", {
    headers: { Authorization: `Bearer ${vendedorToken}` },
  });
  assert(resVendedor.status === 403, "Vendedor NO puede acceder a reporte de ventas (403)");

  // Invalid period still works (defaults to diario)
  const resInvalid = await request("/reports/sales?period=invalid");
  assert(resInvalid.status === 200, "Período inválido no rompe el endpoint");
}

async function testIncomeReport() {
  console.log("\n--- Reporte de Ingresos ---");

  const res = await request("/reports/income?period=diario");
  assert(res.status === 200, "Admin puede acceder a reporte de ingresos");
  assert(res.data.hasOwnProperty("total"), "Respuesta tiene campo total");
  assert(res.data.hasOwnProperty("byDate"), "Respuesta tiene campo byDate");

  // Vendedor cannot access
  const resVendedor = await request("/reports/income?period=diario", {
    headers: { Authorization: `Bearer ${vendedorToken}` },
  });
  assert(resVendedor.status === 403, "Vendedor NO puede acceder a reporte de ingresos (403)");
}

async function testExpensesReport() {
  console.log("\n--- Reporte de Gastos ---");

  const res = await request("/reports/expenses?period=diario");
  assert(res.status === 200, "Admin puede acceder a reporte de gastos");
  assert(res.data.hasOwnProperty("total"), "Respuesta tiene campo total");
  assert(res.data.hasOwnProperty("byDate"), "Respuesta tiene campo byDate");

  // Vendedor cannot access
  const resVendedor = await request("/reports/expenses?period=diario", {
    headers: { Authorization: `Bearer ${vendedorToken}` },
  });
  assert(resVendedor.status === 403, "Vendedor NO puede acceder a reporte de gastos (403)");
}

async function testInvoicesReport() {
  console.log("\n--- Reporte de Facturas ---");

  const res = await request("/reports/invoices");
  assert(res.status === 200, "Admin puede acceder a reporte de facturas");
  assert(res.data.hasOwnProperty("pending"), "Respuesta tiene campo pending");
  assert(res.data.hasOwnProperty("paid"), "Respuesta tiene campo paid");
  assert(res.data.pending.hasOwnProperty("total"), "pending tiene campo total");
  assert(res.data.paid.hasOwnProperty("total"), "paid tiene campo total");

  // Vendedor cannot access
  const resVendedor = await request("/reports/invoices", {
    headers: { Authorization: `Bearer ${vendedorToken}` },
  });
  assert(resVendedor.status === 403, "Vendedor NO puede acceder a reporte de facturas (403)");
}

async function testPendingCreditAccounts() {
  console.log("\n--- Cuentas Corrientes Pendientes ---");

  const res = await request("/reports/credit-accounts-pending");
  assert(res.status === 200, "Admin puede acceder a cuentas corrientes pendientes");
  assert(Array.isArray(res.data), "Respuesta es un array");

  // Vendedor cannot access
  const resVendedor = await request("/reports/credit-accounts-pending", {
    headers: { Authorization: `Bearer ${vendedorToken}` },
  });
  assert(resVendedor.status === 403, "Vendedor NO puede acceder a cuentas corrientes pendientes (403)");
}

async function run() {
  console.log("=== TEST FASE 7: REPORTES ===\n");

  await login();
  await testSalesReport();
  await testIncomeReport();
  await testExpensesReport();
  await testInvoicesReport();
  await testPendingCreditAccounts();

  console.log("\n=== RESUMEN ===");
  console.log(`  Pasaron: ${passed}`);
  console.log(`  Fallaron: ${failed}`);
  console.log(`  Total: ${passed + failed}`);

  if (failed > 0) {
    console.log("\n⚠ Hay tests fallidos!");
    process.exit(1);
  } else {
    console.log("\n✓ Todos los tests pasaron!");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Error ejecutando tests:", err);
  process.exit(1);
});
