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

const cashFlowData = {
  period: "October 2023",
  beginningCash: 185000,
  operating: {
    netIncome: 144500,
    adjustments: [
      { name: "Depreciation & Amortization", amount: 8500 },
      { name: "Accounts Receivable (Increase)", amount: -45000 },
      { name: "Inventory (Increase)", amount: -23000 },
      { name: "Accounts Payable Increase", amount: 12500 },
      { name: "Accrued Expenses Increase", amount: 5600 },
    ],
  },
  investing: [
    { name: "Purchase of Equipment", amount: -45000 },
    { name: "Sale of Investments", amount: 15000 },
    { name: "Capital Expenditures", amount: -25000 },
  ],
  financing: [
    { name: "Proceeds from Loan", amount: 50000 },
    { name: "Loan Repayment", amount: -15000 },
    { name: "Dividends Paid", amount: -25000 },
  ],
};

const sumItems = (items: { amount: number }[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

export default function CashFlowPage() {
  const [period, setPeriod] = useState("oct-2023");
  const [subsidiary, setSubsidiary] = useState("all");

  const operatingAdjustments = sumItems(cashFlowData.operating.adjustments);
  const netOperating = cashFlowData.operating.netIncome + operatingAdjustments;
  const netInvesting = sumItems(cashFlowData.investing);
  const netFinancing = sumItems(cashFlowData.financing);
  const netChange = netOperating + netInvesting + netFinancing;
  const endingCash = cashFlowData.beginningCash + netChange;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reports", href: "/reports" },
          { label: "Cash Flow Statement" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cash Flow Statement
          </h1>
          <p className="text-muted-foreground mt-1">
            Statement of cash flows by activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">picture_as_pdf</span>
            Export PDF
          </Button>
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">table_chart</span>
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${(cashFlowData.beginningCash / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Beginning Cash</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${netChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netChange >= 0 ? "+" : ""}${(netChange / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Net Change</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              ${(endingCash / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Ending Cash</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${netOperating >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${(netOperating / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Operating Cash Flow</p>
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

      {/* Cash Flow Statement */}
      <Card>
        <CardHeader className="border-b text-center">
          <CardTitle className="text-xl">Statement of Cash Flows</CardTitle>
          <p className="text-muted-foreground">For the period ending {cashFlowData.period}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Operating Activities */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-4">
                CASH FLOWS FROM OPERATING ACTIVITIES
              </h3>

              <div className="flex justify-between py-2 pl-4">
                <span>Net Income</span>
                <span>${cashFlowData.operating.netIncome.toLocaleString()}</span>
              </div>

              <p className="text-sm font-semibold text-muted-foreground mt-3 mb-2 pl-4">
                Adjustments to reconcile net income to net cash:
              </p>

              {cashFlowData.operating.adjustments.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-8">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className={item.amount < 0 ? "text-red-600" : ""}>
                    {item.amount < 0 ? "(" : ""}${Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ")" : ""}
                  </span>
                </div>
              ))}

              <div className="flex justify-between py-2 pl-4 font-bold border-t mt-3">
                <span>Net Cash from Operating Activities</span>
                <span className={netOperating >= 0 ? "text-green-600" : "text-red-600"}>
                  ${netOperating.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-4">
                CASH FLOWS FROM INVESTING ACTIVITIES
              </h3>

              {cashFlowData.investing.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.name}</span>
                  <span className={item.amount < 0 ? "text-red-600" : "text-green-600"}>
                    {item.amount < 0 ? "(" : ""}${Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ")" : ""}
                  </span>
                </div>
              ))}

              <div className="flex justify-between py-2 pl-4 font-bold border-t mt-3">
                <span>Net Cash from Investing Activities</span>
                <span className={netInvesting >= 0 ? "text-green-600" : "text-red-600"}>
                  {netInvesting < 0 ? "(" : ""}${Math.abs(netInvesting).toLocaleString()}{netInvesting < 0 ? ")" : ""}
                </span>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <h3 className="text-lg font-bold border-b-2 border-slate-900 dark:border-white pb-1 mb-4">
                CASH FLOWS FROM FINANCING ACTIVITIES
              </h3>

              {cashFlowData.financing.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-4">
                  <span>{item.name}</span>
                  <span className={item.amount < 0 ? "text-red-600" : "text-green-600"}>
                    {item.amount < 0 ? "(" : ""}${Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ")" : ""}
                  </span>
                </div>
              ))}

              <div className="flex justify-between py-2 pl-4 font-bold border-t mt-3">
                <span>Net Cash from Financing Activities</span>
                <span className={netFinancing >= 0 ? "text-green-600" : "text-red-600"}>
                  ${netFinancing.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3 pt-4 border-t-2 border-slate-900 dark:border-white">
              <div className="flex justify-between py-2 font-bold">
                <span>NET INCREASE (DECREASE) IN CASH</span>
                <span className={netChange >= 0 ? "text-green-600" : "text-red-600"}>
                  ${netChange.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span>Cash at Beginning of Period</span>
                <span>${cashFlowData.beginningCash.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-3 font-bold text-lg bg-primary/10 px-4 rounded-lg">
                <span>CASH AT END OF PERIOD</span>
                <span className="text-primary">${endingCash.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
