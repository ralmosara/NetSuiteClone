"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const incomeData = {
  period: "October 2023",
  revenue: [
    { account: "4000 - Product Revenue", amount: 456780 },
    { account: "4100 - Service Revenue", amount: 123450 },
    { account: "4200 - Subscription Revenue", amount: 45600 },
  ],
  cogs: [
    { account: "5000 - Cost of Goods Sold", amount: 234560 },
    { account: "5100 - Direct Labor", amount: 45000 },
    { account: "5200 - Manufacturing Overhead", amount: 23400 },
  ],
  operatingExpenses: [
    { account: "6000 - Salaries & Wages", amount: 125000 },
    { account: "6100 - Rent Expense", amount: 15000 },
    { account: "6200 - Utilities Expense", amount: 3500 },
    { account: "6300 - Marketing & Advertising", amount: 25000 },
    { account: "6400 - Professional Services", amount: 12000 },
    { account: "6500 - Depreciation Expense", amount: 8500 },
    { account: "6600 - Insurance Expense", amount: 4500 },
    { account: "6700 - Office Supplies", amount: 2300 },
  ],
  otherIncome: [
    { account: "7000 - Interest Income", amount: 1250 },
    { account: "7100 - Other Income", amount: 800 },
  ],
  otherExpenses: [
    { account: "8000 - Interest Expense", amount: 5620 },
  ],
};

const sumItems = (items: { amount: number }[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

export default function IncomeStatementPage() {
  const [period, setPeriod] = useState("oct-2023");
  const [subsidiary, setSubsidiary] = useState("all");

  const totalRevenue = sumItems(incomeData.revenue);
  const totalCOGS = sumItems(incomeData.cogs);
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = sumItems(incomeData.operatingExpenses);
  const operatingIncome = grossProfit - totalOperatingExpenses;
  const totalOtherIncome = sumItems(incomeData.otherIncome);
  const totalOtherExpenses = sumItems(incomeData.otherExpenses);
  const netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

  const grossMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);
  const netMargin = ((netIncome / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reports", href: "/reports" },
          { label: "Income Statement" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Income Statement
          </h1>
          <p className="text-muted-foreground mt-1">
            Profit and loss statement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open("/api/pdf/reports/income-statement", "_blank")}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">picture_as_pdf</span>
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/api/export/excel?type=balance-sheet", "_blank")}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">table_chart</span>
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">${(totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">${(grossProfit / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Gross Profit ({grossMargin}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">${(operatingIncome / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Operating Income</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">${(netIncome / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Net Income ({netMargin}%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oct-2023">October 2023</SelectItem>
                  <SelectItem value="sep-2023">September 2023</SelectItem>
                  <SelectItem value="q3-2023">Q3 2023</SelectItem>
                  <SelectItem value="ytd-2023">YTD 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subsidiary</label>
              <Select value={subsidiary} onValueChange={setSubsidiary}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subsidiaries</SelectItem>
                  <SelectItem value="us">US Headquarters</SelectItem>
                  <SelectItem value="uk">UK Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Statement */}
      <Card>
        <CardHeader className="border-b text-center">
          <CardTitle className="text-xl">Statement of Income</CardTitle>
          <p className="text-muted-foreground">For the period ending {incomeData.period}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Revenue */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-3">
                REVENUE
              </h3>
              {incomeData.revenue.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.account}</span>
                  <span>${item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Revenue</span>
                <span>${totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-3">
                COST OF GOODS SOLD
              </h3>
              {incomeData.cogs.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.account}</span>
                  <span>${item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Cost of Goods Sold</span>
                <span>${totalCOGS.toLocaleString()}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between py-3 font-bold text-lg bg-green-50 dark:bg-green-900/20 px-4 rounded-lg">
              <span>GROSS PROFIT</span>
              <span className="text-green-600">${grossProfit.toLocaleString()}</span>
            </div>

            {/* Operating Expenses */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-3">
                OPERATING EXPENSES
              </h3>
              {incomeData.operatingExpenses.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.account}</span>
                  <span>${item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Operating Expenses</span>
                <span>${totalOperatingExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Operating Income */}
            <div className="flex justify-between py-3 font-bold text-lg bg-blue-50 dark:bg-blue-900/20 px-4 rounded-lg">
              <span>OPERATING INCOME</span>
              <span className="text-blue-600">${operatingIncome.toLocaleString()}</span>
            </div>

            {/* Other Income/Expenses */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-3">
                OTHER INCOME & EXPENSES
              </h3>
              {incomeData.otherIncome.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.account}</span>
                  <span className="text-green-600">${item.amount.toLocaleString()}</span>
                </div>
              ))}
              {incomeData.otherExpenses.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.account}</span>
                  <span className="text-red-600">(${ item.amount.toLocaleString()})</span>
                </div>
              ))}
            </div>

            {/* Net Income */}
            <div className="flex justify-between py-3 font-bold text-xl bg-emerald-100 dark:bg-emerald-900/30 px-4 rounded-lg">
              <span>NET INCOME</span>
              <span className="text-emerald-600">${netIncome.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
