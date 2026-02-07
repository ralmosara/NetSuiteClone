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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const payments = [
  {
    id: "pmt-1",
    reference: "ACH-2023-1045",
    paymentDate: "Oct 20, 2023",
    method: "ACH",
    invoices: ["INV-AP-2023-0118"],
    amount: 15280.00,
    status: "completed",
  },
  {
    id: "pmt-2",
    reference: "ACH-2023-0998",
    paymentDate: "Oct 5, 2023",
    method: "ACH",
    invoices: ["INV-AP-2023-0105", "INV-AP-2023-0098"],
    amount: 71250.00,
    status: "completed",
  },
  {
    id: "pmt-3",
    reference: "ACH-2023-0945",
    paymentDate: "Sep 15, 2023",
    method: "ACH",
    invoices: ["INV-AP-2023-0085"],
    amount: 22500.00,
    status: "completed",
  },
  {
    id: "pmt-4",
    reference: "WIRE-2023-0112",
    paymentDate: "Sep 1, 2023",
    method: "Wire",
    invoices: ["INV-AP-2023-0078", "INV-AP-2023-0072"],
    amount: 45800.00,
    status: "completed",
  },
  {
    id: "pmt-5",
    reference: "ACH-2023-0890",
    paymentDate: "Aug 20, 2023",
    method: "ACH",
    invoices: ["INV-AP-2023-0065"],
    amount: 18750.00,
    status: "completed",
  },
  {
    id: "pmt-6",
    reference: "ACH-2023-1100",
    paymentDate: "Nov 5, 2023",
    method: "ACH",
    invoices: ["INV-AP-2023-0132"],
    amount: 32450.00,
    status: "scheduled",
    scheduledDate: "Nov 5, 2023",
  },
];

const paymentMethods = [
  { value: "all", label: "All Methods" },
  { value: "ACH", label: "ACH" },
  { value: "Wire", label: "Wire Transfer" },
  { value: "Check", label: "Check" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
    scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800 border-blue-200" },
    processing: { label: "Processing", className: "bg-amber-100 text-amber-800 border-amber-200" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.completed;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getMethodBadge = (method: string) => {
  const config: Record<string, { icon: string; className: string }> = {
    ACH: { icon: "account_balance", className: "text-blue-600" },
    Wire: { icon: "bolt", className: "text-purple-600" },
    Check: { icon: "checkbook", className: "text-slate-600" },
  };
  const { icon, className } = config[method] || config.ACH;
  return (
    <div className="flex items-center gap-2">
      <span className={`material-symbols-outlined text-[18px] ${className}`}>{icon}</span>
      <span>{method}</span>
    </div>
  );
};

export default function SupplierPaymentsPage() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const filteredPayments = payments.filter((pmt) => {
    const matchesSearch = pmt.reference.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "all" || pmt.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalPaid = payments
    .filter((pmt) => pmt.status === "completed")
    .reduce((sum, pmt) => sum + pmt.amount, 0);

  const scheduledPayments = payments.filter((pmt) => pmt.status === "scheduled");
  const scheduledTotal = scheduledPayments.reduce((sum, pmt) => sum + pmt.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Payments
          </h1>
          <p className="text-muted-foreground mt-1">
            Track payments received from your customer.
          </p>
        </div>
        <Button variant="outline">
          <span className="material-symbols-outlined text-[18px] mr-2">download</span>
          Export Statement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Total Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(totalPaid / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Total Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {scheduledPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${(scheduledTotal / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Upcoming Amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Payment Alert */}
      {scheduledPayments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-blue-600">schedule</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                  Upcoming Payment Scheduled
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Payment of ${scheduledPayments[0].amount.toLocaleString()} is scheduled for{" "}
                  {scheduledPayments[0].scheduledDate}. This will be deposited via{" "}
                  {scheduledPayments[0].method} to your registered bank account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Payment History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((option) => (
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
                <TableHead className="font-bold">REFERENCE</TableHead>
                <TableHead className="font-bold">DATE</TableHead>
                <TableHead className="font-bold">METHOD</TableHead>
                <TableHead className="font-bold">INVOICES PAID</TableHead>
                <TableHead className="font-bold text-right">AMOUNT</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Link
                      href={`/supplier/payments/${payment.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {payment.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.paymentDate}</TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {payment.invoices.map((inv) => (
                        <Badge key={inv} variant="secondary" className="text-xs">
                          {inv.split("-").slice(-1)[0]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-green-600">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Banking Information</CardTitle>
            <Button variant="ghost" size="sm">
              <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600">account_balance</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">Chase Business Banking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600">tag</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium font-mono">****4521</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600">route</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Routing Number</p>
                  <p className="font-medium font-mono">****7890</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600">verified</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
