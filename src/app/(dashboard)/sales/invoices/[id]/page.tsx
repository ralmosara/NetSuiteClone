"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const getStatusBadge = (status: string, dueDate?: Date) => {
  if (status === "open" && dueDate && new Date(dueDate) < new Date()) {
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
  }

  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    open: { label: "Open", className: "bg-blue-100 text-blue-800 border-blue-200" },
    partially_paid: { label: "Partial", className: "bg-amber-100 text-amber-800 border-amber-200" },
    paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
    void: { label: "Void", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "check",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    memo: "",
  });

  // Open payment dialog if action=payment in URL
  useEffect(() => {
    if (searchParams.get("action") === "payment") {
      setPaymentDialogOpen(true);
    }
  }, [searchParams]);

  const { data: invoice, isLoading, error } = trpc.sales.getInvoice.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const recordPayment = trpc.sales.recordPayment.useMutation({
    onSuccess: (payment) => {
      toast({ title: "Payment recorded", description: `Payment ${payment.paymentNumber} has been recorded.` });
      utils.sales.getInvoice.invalidate({ id: params.id as string });
      setPaymentDialogOpen(false);
      resetPaymentForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsProcessing(false);
    },
  });

  const voidInvoice = trpc.sales.voidInvoice.useMutation({
    onSuccess: () => {
      toast({ title: "Invoice voided", description: "Invoice has been voided successfully." });
      utils.sales.getInvoice.invalidate({ id: params.id as string });
      setVoidDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsProcessing(false);
    },
  });

  const deletePayment = trpc.sales.deletePayment.useMutation({
    onSuccess: () => {
      toast({ title: "Payment deleted", description: "Payment has been reversed successfully." });
      utils.sales.getInvoice.invalidate({ id: params.id as string });
      setDeletePaymentId(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: "",
      paymentMethod: "check",
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: "",
      memo: "",
    });
    setIsProcessing(false);
  };

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid payment amount", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    recordPayment.mutate({
      invoiceId: params.id as string,
      amount,
      paymentMethod: paymentForm.paymentMethod,
      paymentDate: new Date(paymentForm.paymentDate),
      referenceNumber: paymentForm.referenceNumber || undefined,
      memo: paymentForm.memo || undefined,
    });
  };

  const handleVoid = () => {
    setIsProcessing(true);
    voidInvoice.mutate({ id: params.id as string });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
        <p className="text-muted-foreground mb-4">The invoice you're looking for doesn't exist.</p>
        <Link href="/sales/invoices">
          <Button>Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const amountDue = Number(invoice.amountDue);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Invoices", href: "/sales/invoices" },
          { label: invoice.invoiceNumber },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            {getStatusBadge(invoice.status, invoice.dueDate)}
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(invoice.invoiceDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px] mr-2">more_vert</span>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`/api/pdf/invoice/${invoice.id}`, "_blank")}>
                <span className="material-symbols-outlined text-[18px] mr-2">picture_as_pdf</span>
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <span className="material-symbols-outlined text-[18px] mr-2">print</span>
                Print Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setVoidDialogOpen(true)}
                className="text-destructive focus:text-destructive"
                disabled={invoice.status === "void" || invoice.status === "paid"}
              >
                <span className="material-symbols-outlined text-[18px] mr-2">block</span>
                Void Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="bg-primary hover:bg-blue-600"
            onClick={() => {
              setPaymentForm({ ...paymentForm, amount: amountDue.toFixed(2) });
              setPaymentDialogOpen(true);
            }}
            disabled={invoice.status === "paid" || invoice.status === "void"}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">payments</span>
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">#</TableHead>
                    <TableHead className="font-bold">ITEM</TableHead>
                    <TableHead className="font-bold">DESCRIPTION</TableHead>
                    <TableHead className="font-bold text-right">QTY</TableHead>
                    <TableHead className="font-bold text-right">UNIT PRICE</TableHead>
                    <TableHead className="font-bold text-right">AMOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lines.map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.lineNumber}</TableCell>
                      <TableCell className="font-medium">{line.item?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{line.description || "-"}</TableCell>
                      <TableCell className="text-right">{Number(line.quantity)}</TableCell>
                      <TableCell className="text-right">${Number(line.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">${Number(line.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(invoice.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(invoice.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${Number(invoice.discountAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(invoice.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number(invoice.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${Number(invoice.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(invoice.amountPaid) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid</span>
                    <span>-${Number(invoice.amountPaid).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Balance Due</span>
                  <span className={amountDue > 0 ? "text-red-600" : "text-green-600"}>
                    ${amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoice.payments && invoice.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">PAYMENT #</TableHead>
                      <TableHead className="font-bold">DATE</TableHead>
                      <TableHead className="font-bold">METHOD</TableHead>
                      <TableHead className="font-bold">REFERENCE</TableHead>
                      <TableHead className="font-bold text-right">AMOUNT</TableHead>
                      <TableHead className="font-bold text-center">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod.replace("_", " ")}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.referenceNumber || "-"}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          ${Number(payment.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeletePaymentId(payment.id)}
                              title="Reverse Payment"
                            >
                              <span className="material-symbols-outlined text-[18px]">undo</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">payments</span>
                  <p>No payments recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Link href={`/sales/customers/${invoice.customer.id}`} className="font-medium text-primary hover:underline">
                  {invoice.customer.companyName}
                </Link>
                <p className="text-sm text-muted-foreground">{invoice.customer.customerId}</p>
              </div>
              {invoice.customer.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${invoice.customer.email}`} className="text-primary hover:underline">
                    {invoice.customer.email}
                  </a>
                </div>
              )}
              {invoice.customer.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{invoice.customer.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className={new Date(invoice.dueDate) < new Date() && invoice.status === "open" ? "text-red-600 font-medium" : ""}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terms</p>
                <p>{invoice.terms || "Net 30"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p>{invoice.currency?.code} - {invoice.currency?.name}</p>
              </div>
              {invoice.salesOrder && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sales Order</p>
                  <Link href={`/sales/orders/${invoice.salesOrder.id}`} className="text-primary hover:underline">
                    {invoice.salesOrder.orderNumber}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memo */}
          {invoice.memo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Memo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{invoice.memo}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={(open) => { setPaymentDialogOpen(open); if (!open) resetPaymentForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {invoice.invoiceNumber}. Balance due: ${amountDue.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="ach">ACH</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference #</Label>
                <Input
                  id="referenceNumber"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="Check # / Transaction ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">Memo</Label>
              <Textarea
                id="memo"
                value={paymentForm.memo}
                onChange={(e) => setPaymentForm({ ...paymentForm, memo: e.target.value })}
                placeholder="Optional notes"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={isProcessing} className="bg-primary hover:bg-blue-600">
              {isProcessing ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to void {invoice.invoiceNumber}? This action cannot be undone.
              {invoice.payments?.length > 0 && (
                <span className="block mt-2 text-amber-600">
                  Note: Invoices with payments cannot be voided. Please reverse all payments first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleVoid} disabled={isProcessing || (invoice.payments?.length || 0) > 0}>
              {isProcessing ? "Processing..." : "Void Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <Dialog open={!!deletePaymentId} onOpenChange={(open) => !open && setDeletePaymentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to reverse this payment? This will update the invoice balance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePaymentId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletePaymentId && deletePayment.mutate({ id: deletePaymentId })}
              disabled={deletePayment.isPending}
            >
              {deletePayment.isPending ? "Reversing..." : "Reverse Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
