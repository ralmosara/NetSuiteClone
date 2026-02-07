"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-800 border-blue-200" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const { data: quote, isLoading, error } = trpc.sales.getQuote.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const deleteQuote = trpc.sales.deleteQuote.useMutation({
    onSuccess: () => {
      toast({ title: "Quote deleted", description: "Quote has been deleted successfully." });
      router.push("/sales/quotes");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    },
  });

  const updateQuote = trpc.sales.updateQuote.useMutation({
    onSuccess: () => {
      toast({ title: "Status updated", description: "Quote status has been updated." });
      utils.sales.getQuote.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const convertToOrder = trpc.sales.convertQuoteToOrder.useMutation({
    onSuccess: (order) => {
      toast({ title: "Order created", description: `Sales order ${order.orderNumber} has been created.` });
      router.push(`/sales/orders/${order.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsConverting(false);
      setConvertDialogOpen(false);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteQuote.mutate({ id: params.id as string });
  };

  const handleConvert = () => {
    setIsConverting(true);
    convertToOrder.mutate({ quoteId: params.id as string });
  };

  const handleStatusChange = (status: string) => {
    updateQuote.mutate({ id: params.id as string, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Quote Not Found</h2>
        <p className="text-muted-foreground mb-4">The quote you're looking for doesn't exist.</p>
        <Link href="/sales/quotes">
          <Button>Back to Quotes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Quotes", href: "/sales/quotes" },
          { label: quote.quoteNumber },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {quote.quoteNumber}
            </h1>
            {getStatusBadge(quote.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(quote.quoteDate).toLocaleDateString()}
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
              <DropdownMenuItem onClick={() => handleStatusChange("sent")} disabled={quote.status !== "draft"}>
                <span className="material-symbols-outlined text-[18px] mr-2">send</span>
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("accepted")} disabled={quote.status === "accepted"}>
                <span className="material-symbols-outlined text-[18px] mr-2">check_circle</span>
                Mark as Accepted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("rejected")} disabled={quote.status === "accepted"}>
                <span className="material-symbols-outlined text-[18px] mr-2">cancel</span>
                Mark as Rejected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                <span className="material-symbols-outlined text-[18px] mr-2">delete</span>
                Delete Quote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="bg-primary hover:bg-blue-600"
            onClick={() => setConvertDialogOpen(true)}
            disabled={quote.status === "accepted" || quote.status === "rejected"}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">shopping_cart</span>
            Convert to Order
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
                  {quote.lines.map((line: any) => (
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
                  <span>${Number(quote.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(quote.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${Number(quote.discountAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(quote.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number(quote.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${Number(quote.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Memo */}
          {(quote.terms || quote.memo) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.terms && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Terms</p>
                    <p>{quote.terms}</p>
                  </div>
                )}
                {quote.memo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Memo</p>
                    <p>{quote.memo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Link href={`/sales/customers/${quote.customer.id}`} className="font-medium text-primary hover:underline">
                  {quote.customer.companyName}
                </Link>
                <p className="text-sm text-muted-foreground">{quote.customer.customerId}</p>
              </div>
              {quote.customer.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${quote.customer.email}`} className="text-primary hover:underline">
                    {quote.customer.email}
                  </a>
                </div>
              )}
              {quote.customer.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{quote.customer.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quote Date</p>
                <p>{new Date(quote.quoteDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiration Date</p>
                <p className={quote.expirationDate && new Date(quote.expirationDate) < new Date() ? "text-red-600" : ""}>
                  {quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p>{quote.currency?.code} - {quote.currency?.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {quote.quoteNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Quote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Sales Order</DialogTitle>
            <DialogDescription>
              This will create a new sales order from {quote.quoteNumber} and mark the quote as accepted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)} disabled={isConverting}>
              Cancel
            </Button>
            <Button onClick={handleConvert} disabled={isConverting} className="bg-primary hover:bg-blue-600">
              {isConverting ? "Converting..." : "Create Sales Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
