"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const intercompanyTransfers = [
  {
    id: "ict-1",
    transferNumber: "ICT-2023-0045",
    fromSubsidiary: "US Headquarters",
    fromCode: "US-HQ",
    toSubsidiary: "UK Operations",
    toCode: "UK-OPS",
    transferDate: "Oct 24, 2023",
    fromCurrency: "USD",
    toCurrency: "GBP",
    exchangeRate: 0.82,
    amount: 150000,
    convertedAmount: 123000,
    status: "pending",
    memo: "Q4 operational funding",
  },
  {
    id: "ict-2",
    transferNumber: "ICT-2023-0044",
    fromSubsidiary: "US Headquarters",
    fromCode: "US-HQ",
    toSubsidiary: "Germany GmbH",
    toCode: "DE-GMBH",
    transferDate: "Oct 20, 2023",
    fromCurrency: "USD",
    toCurrency: "EUR",
    exchangeRate: 0.92,
    amount: 75000,
    convertedAmount: 69000,
    status: "approved",
    memo: "Equipment purchase funding",
  },
  {
    id: "ict-3",
    transferNumber: "ICT-2023-0043",
    fromSubsidiary: "UK Operations",
    fromCode: "UK-OPS",
    toSubsidiary: "US Headquarters",
    toCode: "US-HQ",
    transferDate: "Oct 15, 2023",
    fromCurrency: "GBP",
    toCurrency: "USD",
    exchangeRate: 1.22,
    amount: 50000,
    convertedAmount: 61000,
    status: "posted",
    memo: "Profit repatriation",
  },
  {
    id: "ict-4",
    transferNumber: "ICT-2023-0042",
    fromSubsidiary: "Germany GmbH",
    fromCode: "DE-GMBH",
    toSubsidiary: "France SARL",
    toCode: "FR-SARL",
    transferDate: "Oct 10, 2023",
    fromCurrency: "EUR",
    toCurrency: "EUR",
    exchangeRate: 1.0,
    amount: 25000,
    convertedAmount: 25000,
    status: "posted",
    memo: "Shared services allocation",
  },
  {
    id: "ict-5",
    transferNumber: "ICT-2023-0041",
    fromSubsidiary: "US Headquarters",
    fromCode: "US-HQ",
    toSubsidiary: "Canada Inc",
    toCode: "CA-INC",
    transferDate: "Oct 5, 2023",
    fromCurrency: "USD",
    toCurrency: "CAD",
    exchangeRate: 1.36,
    amount: 100000,
    convertedAmount: 136000,
    status: "posted",
    memo: "Inventory prepayment",
  },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "posted", label: "Posted" },
  { value: "void", label: "Void" },
];

const subsidiaryOptions = [
  { value: "all", label: "All Subsidiaries" },
  { value: "US-HQ", label: "US Headquarters" },
  { value: "UK-OPS", label: "UK Operations" },
  { value: "DE-GMBH", label: "Germany GmbH" },
  { value: "FR-SARL", label: "France SARL" },
  { value: "CA-INC", label: "Canada Inc" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
    posted: { label: "Posted", className: "bg-green-100 text-green-800 border-green-200" },
    void: { label: "Void", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function IntercompanyPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subsidiaryFilter, setSubsidiaryFilter] = useState("all");

  const filteredTransfers = intercompanyTransfers.filter((t) => {
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.fromSubsidiary.toLowerCase().includes(search.toLowerCase()) ||
      t.toSubsidiary.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSubsidiary =
      subsidiaryFilter === "all" ||
      t.fromCode === subsidiaryFilter ||
      t.toCode === subsidiaryFilter;
    return matchesSearch && matchesStatus && matchesSubsidiary;
  });

  const totalPending = intercompanyTransfers
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPosted = intercompanyTransfers
    .filter((t) => t.status === "posted")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Intercompany Transfers" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Intercompany Transfers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage fund transfers between subsidiaries with currency conversion.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600">
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {intercompanyTransfers.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {intercompanyTransfers.filter((t) => t.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${(totalPending / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Pending Value (USD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(totalPosted / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Posted This Month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Transfers</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search transfers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Subsidiary" />
                </SelectTrigger>
                <SelectContent>
                  {subsidiaryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">TRANSFER #</TableHead>
                <TableHead className="font-bold">FROM</TableHead>
                <TableHead className="font-bold">TO</TableHead>
                <TableHead className="font-bold">DATE</TableHead>
                <TableHead className="font-bold text-right">AMOUNT</TableHead>
                <TableHead className="font-bold text-center">RATE</TableHead>
                <TableHead className="font-bold text-right">CONVERTED</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Link
                      href={`/finance/intercompany/${transfer.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {transfer.transferNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.fromSubsidiary}</p>
                      <p className="text-xs text-muted-foreground">{transfer.fromCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-muted-foreground text-[16px]">
                        arrow_forward
                      </span>
                      <div>
                        <p className="font-medium">{transfer.toSubsidiary}</p>
                        <p className="text-xs text-muted-foreground">{transfer.toCode}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transfer.transferDate}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">
                      {transfer.fromCurrency} {transfer.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono">
                      {transfer.exchangeRate}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-bold">
                      {transfer.toCurrency} {transfer.convertedAmount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      {transfer.status === "pending" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subsidiary Balances Card */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Intercompany Balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">SUBSIDIARY</TableHead>
                <TableHead className="font-bold">CURRENCY</TableHead>
                <TableHead className="font-bold text-right">RECEIVABLE</TableHead>
                <TableHead className="font-bold text-right">PAYABLE</TableHead>
                <TableHead className="font-bold text-right">NET BALANCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">US Headquarters</TableCell>
                <TableCell>USD</TableCell>
                <TableCell className="text-right font-mono text-green-600">$185,000</TableCell>
                <TableCell className="text-right font-mono text-red-600">$61,000</TableCell>
                <TableCell className="text-right font-mono font-bold">$124,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">UK Operations</TableCell>
                <TableCell>GBP</TableCell>
                <TableCell className="text-right font-mono text-green-600">£41,000</TableCell>
                <TableCell className="text-right font-mono text-red-600">£123,000</TableCell>
                <TableCell className="text-right font-mono font-bold text-red-600">-£82,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Germany GmbH</TableCell>
                <TableCell>EUR</TableCell>
                <TableCell className="text-right font-mono text-green-600">€69,000</TableCell>
                <TableCell className="text-right font-mono text-red-600">€25,000</TableCell>
                <TableCell className="text-right font-mono font-bold">€44,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Canada Inc</TableCell>
                <TableCell>CAD</TableCell>
                <TableCell className="text-right font-mono text-green-600">C$136,000</TableCell>
                <TableCell className="text-right font-mono text-red-600">C$0</TableCell>
                <TableCell className="text-right font-mono font-bold">C$136,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
