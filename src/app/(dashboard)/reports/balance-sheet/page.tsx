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

const balanceSheetData = {
  asOf: "October 31, 2023",
  assets: {
    current: [
      { account: "1000 - Cash and Cash Equivalents", amount: 245680 },
      { account: "1100 - Accounts Receivable", amount: 189450 },
      { account: "1150 - Allowance for Doubtful Accounts", amount: -5000 },
      { account: "1200 - Inventory", amount: 892340 },
      { account: "1300 - Prepaid Expenses", amount: 23400 },
    ],
    fixed: [
      { account: "1500 - Property, Plant & Equipment", amount: 1250000 },
      { account: "1550 - Accumulated Depreciation", amount: -312500 },
      { account: "1600 - Intangible Assets", amount: 85000 },
    ],
  },
  liabilities: {
    current: [
      { account: "2000 - Accounts Payable", amount: 156780 },
      { account: "2100 - Accrued Expenses", amount: 45600 },
      { account: "2200 - Short-term Loans", amount: 100000 },
      { account: "2300 - Current Portion of Long-term Debt", amount: 50000 },
    ],
    longTerm: [
      { account: "2500 - Long-term Debt", amount: 450000 },
      { account: "2600 - Deferred Tax Liabilities", amount: 28500 },
    ],
  },
  equity: [
    { account: "3000 - Common Stock", amount: 500000 },
    { account: "3100 - Retained Earnings", amount: 892490 },
    { account: "3200 - Current Year Earnings", amount: 144500 },
  ],
};

const sumItems = (items: { amount: number }[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

export default function BalanceSheetPage() {
  const [period, setPeriod] = useState("oct-2023");
  const [subsidiary, setSubsidiary] = useState("all");

  const totalCurrentAssets = sumItems(balanceSheetData.assets.current);
  const totalFixedAssets = sumItems(balanceSheetData.assets.fixed);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = sumItems(balanceSheetData.liabilities.current);
  const totalLongTermLiabilities = sumItems(balanceSheetData.liabilities.longTerm);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = sumItems(balanceSheetData.equity);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reports", href: "/reports" },
          { label: "Balance Sheet" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Balance Sheet
          </h1>
          <p className="text-muted-foreground mt-1">
            Consolidated statement of financial position
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open("/api/pdf/reports/balance-sheet", "_blank")}
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

      {/* Balance Sheet */}
      <Card>
        <CardHeader className="border-b text-center">
          <CardTitle className="text-xl">Statement of Financial Position</CardTitle>
          <p className="text-muted-foreground">As of {balanceSheetData.asOf}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Assets */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-4">
                ASSETS
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold text-muted-foreground mb-2">Current Assets</h4>
                {balanceSheetData.assets.current.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 pl-4">
                    <span>{item.account}</span>
                    <span className={item.amount < 0 ? "text-red-600" : ""}>
                      {item.amount < 0 ? "(" : ""}${Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ")" : ""}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-1 pl-4 font-semibold border-t mt-2">
                  <span>Total Current Assets</span>
                  <span>${totalCurrentAssets.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-muted-foreground mb-2">Fixed Assets</h4>
                {balanceSheetData.assets.fixed.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 pl-4">
                    <span>{item.account}</span>
                    <span className={item.amount < 0 ? "text-red-600" : ""}>
                      {item.amount < 0 ? "(" : ""}${Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ")" : ""}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-1 pl-4 font-semibold border-t mt-2">
                  <span>Total Fixed Assets</span>
                  <span>${totalFixedAssets.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-slate-900 dark:border-white">
                <span>TOTAL ASSETS</span>
                <span>${totalAssets.toLocaleString()}</span>
              </div>
            </div>

            {/* Liabilities */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-4">
                LIABILITIES
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold text-muted-foreground mb-2">Current Liabilities</h4>
                {balanceSheetData.liabilities.current.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 pl-4">
                    <span>{item.account}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 pl-4 font-semibold border-t mt-2">
                  <span>Total Current Liabilities</span>
                  <span>${totalCurrentLiabilities.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-muted-foreground mb-2">Long-term Liabilities</h4>
                {balanceSheetData.liabilities.longTerm.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 pl-4">
                    <span>{item.account}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 pl-4 font-semibold border-t mt-2">
                  <span>Total Long-term Liabilities</span>
                  <span>${totalLongTermLiabilities.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between py-2 font-bold border-t-2">
                <span>TOTAL LIABILITIES</span>
                <span>${totalLiabilities.toLocaleString()}</span>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-4">
                STOCKHOLDERS' EQUITY
              </h3>

              {balanceSheetData.equity.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.account}</span>
                  <span>${item.amount.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between py-2 font-bold border-t-2 mt-2">
                <span>TOTAL EQUITY</span>
                <span>${totalEquity.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Liabilities + Equity */}
            <div className="flex justify-between py-3 font-bold text-lg bg-slate-100 dark:bg-slate-800 px-4 rounded-lg">
              <span>TOTAL LIABILITIES & EQUITY</span>
              <span>${(totalLiabilities + totalEquity).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
