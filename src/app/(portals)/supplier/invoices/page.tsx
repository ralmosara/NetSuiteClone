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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const invoices = [
  {
    id: "inv-1",
    invoiceNumber: "INV-AP-2023-0145",
    poNumber: "PO-5012",
    invoiceDate: "Oct 25, 2023",
    dueDate: "Nov 24, 2023",
    amount: 58677.53,
    status: "pending",
    submittedDate: "Oct 25, 2023",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-AP-2023-0132",
    poNumber: "PO-5008",
    invoiceDate: "Oct 12, 2023",
    dueDate: "Nov 11, 2023",
    amount: 32450.00,
    status: "approved",
    submittedDate: "Oct 12, 2023",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-AP-2023-0118",
    poNumber: "PO-5003",
    invoiceDate: "Oct 5, 2023",
    dueDate: "Nov 4, 2023",
    amount: 15280.00,
    status: "paid",
    submittedDate: "Oct 5, 2023",
    paidDate: "Oct 20, 2023",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-AP-2023-0105",
    poNumber: "PO-4998",
    invoiceDate: "Sep 28, 2023",
    dueDate: "Oct 28, 2023",
    amount: 42500.00,
    status: "paid",
    submittedDate: "Sep 28, 2023",
    paidDate: "Oct 15, 2023",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-AP-2023-0098",
    poNumber: "PO-4985",
    invoiceDate: "Sep 20, 2023",
    dueDate: "Oct 20, 2023",
    amount: 28750.00,
    status: "paid",
    submittedDate: "Sep 20, 2023",
    paidDate: "Oct 5, 2023",
  },
  {
    id: "inv-6",
    invoiceNumber: "INV-AP-2023-0089",
    poNumber: "PO-4972",
    invoiceDate: "Sep 12, 2023",
    dueDate: "Oct 12, 2023",
    amount: 18350.00,
    status: "rejected",
    submittedDate: "Sep 12, 2023",
    rejectionReason: "Invoice amount does not match PO total",
  },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending Review", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
    paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function SupplierInvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingAmount = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "approved")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Invoices
          </h1>
          <p className="text-muted-foreground mt-1">
            Submit and track your invoices.
          </p>
        </div>
        <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              Submit Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit New Invoice</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" placeholder="INV-..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PO-5012">PO-5012</SelectItem>
                      <SelectItem value="PO-5015">PO-5015</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input id="invoiceDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <span className="material-symbols-outlined text-slate-400 text-[32px] mb-2">
                    cloud_upload
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop invoice PDF or click to browse
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewInvoiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-blue-600">
                  Submit Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {invoices.filter((inv) => inv.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              ${(pendingAmount / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Outstanding Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(paidAmount / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Paid This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Invoices</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
                <TableHead className="font-bold">INVOICE NUMBER</TableHead>
                <TableHead className="font-bold">PO NUMBER</TableHead>
                <TableHead className="font-bold">INVOICE DATE</TableHead>
                <TableHead className="font-bold">DUE DATE</TableHead>
                <TableHead className="font-bold text-right">AMOUNT</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Link
                      href={`/supplier/invoices/${invoice.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/supplier/orders/${invoice.poNumber}`}
                      className="text-muted-foreground hover:text-primary hover:underline"
                    >
                      {invoice.poNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{invoice.invoiceDate}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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

      {/* Rejected Invoice Alert */}
      {invoices.some((inv) => inv.status === "rejected") && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400">
                  Rejected Invoice Requires Attention
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Invoice INV-AP-2023-0089 was rejected. Reason: Invoice amount does not match PO total.
                  Please review and resubmit with the correct amount.
                </p>
                <Button variant="outline" size="sm" className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
                  Review & Resubmit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
