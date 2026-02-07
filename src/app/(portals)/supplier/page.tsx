"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const recentOrders = [
  { id: "po-1", poNumber: "PO-5012", date: "Oct 24, 2023", total: 58677.53, status: "approved" },
  { id: "po-2", poNumber: "PO-5008", date: "Oct 18, 2023", total: 32450.00, status: "received" },
  { id: "po-3", poNumber: "PO-5003", date: "Oct 10, 2023", total: 15280.00, status: "received" },
];

const pendingInvoices = [
  { id: "inv-1", invoiceNumber: "INV-AP-2023-0145", date: "Oct 25, 2023", amount: 58677.53, dueDate: "Nov 24, 2023" },
  { id: "inv-2", invoiceNumber: "INV-AP-2023-0132", date: "Oct 12, 2023", amount: 32450.00, dueDate: "Nov 11, 2023" },
];

const recentPayments = [
  { id: "pmt-1", reference: "ACH-2023-1045", date: "Oct 20, 2023", amount: 15280.00, invoices: 1 },
  { id: "pmt-2", reference: "ACH-2023-0998", date: "Oct 5, 2023", amount: 42500.00, invoices: 2 },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
    received: { label: "Received", className: "bg-green-100 text-green-800 border-green-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function SupplierPortalPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, Apple Inc.
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your account activity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">shopping_cart</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground">Open Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">receipt_long</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">2</div>
                <p className="text-xs text-muted-foreground">Pending Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[24px]">payments</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">$91.1K</div>
                <p className="text-xs text-muted-foreground">Outstanding Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">trending_up</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">$245K</div>
                <p className="text-xs text-muted-foreground">YTD Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
            <Link href="/supplier/orders">
              <Button variant="ghost" size="sm">
                View All
                <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">PO NUMBER</TableHead>
                  <TableHead className="font-bold">DATE</TableHead>
                  <TableHead className="font-bold text-right">TOTAL</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/supplier/orders/${order.id}`} className="font-medium text-primary hover:underline">
                        {order.poNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-lg">Pending Invoices</CardTitle>
            <Link href="/supplier/invoices">
              <Button variant="ghost" size="sm">
                View All
                <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">INVOICE</TableHead>
                  <TableHead className="font-bold">DUE DATE</TableHead>
                  <TableHead className="font-bold text-right">AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link href={`/supplier/invoices/${invoice.id}`} className="font-medium text-primary hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${invoice.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg">Recent Payments</CardTitle>
          <Link href="/supplier/payments">
            <Button variant="ghost" size="sm">
              View All
              <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">REFERENCE</TableHead>
                <TableHead className="font-bold">DATE</TableHead>
                <TableHead className="font-bold text-center">INVOICES PAID</TableHead>
                <TableHead className="font-bold text-right">AMOUNT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Link href={`/supplier/payments/${payment.id}`} className="font-medium text-primary hover:underline">
                      {payment.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                  <TableCell className="text-center">{payment.invoices}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-green-600">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="material-symbols-outlined text-[28px] mb-2 text-primary">upload_file</span>
              <span>Submit Invoice</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="material-symbols-outlined text-[28px] mb-2 text-primary">visibility</span>
              <span>View Orders</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="material-symbols-outlined text-[28px] mb-2 text-primary">account_balance</span>
              <span>Update Banking</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="material-symbols-outlined text-[28px] mb-2 text-primary">support_agent</span>
              <span>Contact Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
