import { catchAsync } from "../errors/catchAsync.js";
import * as reportService from "../services/reportService.js";

export const sales = catchAsync(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const report = await reportService.getSalesReport(period, startDate, endDate);
  res.json(report);
});

export const income = catchAsync(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const report = await reportService.getIncomeReport(period, startDate, endDate);
  res.json(report);
});

export const expenses = catchAsync(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const report = await reportService.getExpensesReport(period, startDate, endDate);
  res.json(report);
});

export const invoices = catchAsync(async (req, res) => {
  const report = await reportService.getInvoicesReport();
  res.json(report);
});

export const pendingCreditAccounts = catchAsync(async (req, res) => {
  const accounts = await reportService.getPendingCreditAccounts();
  res.json(accounts);
});
