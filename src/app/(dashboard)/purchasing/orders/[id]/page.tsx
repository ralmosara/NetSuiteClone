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
    pending_approval: { label: "Pending Approval", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-800 border-blue-200" },
    partially_received: { label: "Partial Receipt", className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    received: { label: "Received", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: order, isLoading, error } = trpc.purchasing.getPurchaseOrder.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const approvePO = trpc.purchasing.approvePurchaseOrder.useMutation({
    onSuccess: () => {
      toast({ title: "PO approved", description: "Purchase order has been approved." });
      utils.purchasing.getPurchaseOrder.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const updatePO = trpc.purchasing.updatePurchaseOrder.useMutation({
    onSuccess: () => {
      toast({ title: "Status updated", description: "Purchase order status has been updated." });
      utils.purchasing.getPurchaseOrder.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const receivePO = trpc.purchasing.receivePurchaseOrder.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Items received",
        description: `Receipt ${data.receipt.receiptNumber} has been created.`
      });
      utils.purchasing.getPurchaseOrder.invalidate({ id: params.id as string });
      setIsProcessing(false);
      setReceiveDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsProcessing(false);
      setReceiveDialogOpen(false);
    },
  });

  const closePO = trpc.purchasing.closePurchaseOrder.useMutation({
    onSuccess: () => {
      toast({ title: "PO closed", description: "Purchase order has been closed." });
      utils.purchasing.getPurchaseOrder.invalidate({ id: params.id as string });
      setIsProcessing(false);
      setCloseDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsProcessing(false);
      setCloseDialogOpen(false);
    },
  });

  const cancelPO = trpc.purchasing.cancelPurchaseOrder.useMutation({
    onSuccess: () => {
      toast({ title: "PO cancelled", description: "Purchase order has been cancelled." });
      utils.purchasing.getPurchaseOrder.invalidate({ id: params.id as string });
      setIsProcessing(false);
      setCancelDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsProcessing(false);
      setCancelDialogOpen(false);
    },
  });

  const handleApprove = () => {
    approvePO.mutate({ id: params.id as string });
  };

  const handleSend = () => {
    updatePO.mutate({ id: params.id as string, status: "sent" });
  };

  const handleReceive = () => {
    setIsProcessing(true);
    receivePO.mutate({ id: params.id as string });
  };

  const handleClose = () => {
    setIsProcessing(true);
    closePO.mutate({ id: params.id as string });
  };

  const handleCancel = () => {
    setIsProcessing(true);
    cancelPO.mutate({ id: params.id as string });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Purchase Order Not Found</h2>
        <p className="text-muted-foreground mb-4">The purchase order you're looking for doesn't exist.</p>
        <Link href="/purchasing/orders">
          <Button>Back to Purchase Orders</Button>
        </Link>
      </div>
    );
  }

  const canApprove = order.status === "draft" || order.status === "pending_approval";
  const canSend = order.status === "approved";
  const canReceive = order.status === "approved" || order.status === "sent" || order.status === "partially_received";
  const canClose = order.status === "received" || order.status === "partially_received";
  const canCancel = !["received", "closed", "cancelled"].includes(order.status) && order.receipts.length === 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Purchase Orders", href: "/purchasing/orders" },
          { label: order.poNumber },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {order.poNumber}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(order.orderDate).toLocaleDateString()}
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
              <DropdownMenuItem onClick={handleApprove} disabled={!canApprove}>
                <span className="material-symbols-outlined text-[18px] mr-2">check_circle</span>
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSend} disabled={!canSend}>
                <span className="material-symbols-outlined text-[18px] mr-2">send</span>
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReceiveDialogOpen(true)} disabled={!canReceive}>
                <span className="material-symbols-outlined text-[18px] mr-2">inventory</span>
                Receive Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCloseDialogOpen(true)} disabled={!canClose}>
                <span className="material-symbols-outlined text-[18px] mr-2">lock</span>
                Close PO
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCancelDialogOpen(true)}
                disabled={!canCancel}
                className="text-destructive focus:text-destructive"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">cancel</span>
                Cancel PO
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/purchasing/orders/${order.id}/edit`}>
            <Button variant="outline" disabled={order.status === "closed" || order.status === "cancelled"}>
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
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
                    <TableHead className="font-bold text-right">RECEIVED</TableHead>
                    <TableHead className="font-bold text-right">UNIT PRICE</TableHead>
                    <TableHead className="font-bold text-right">AMOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lines.map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.lineNumber}</TableCell>
                      <TableCell className="font-medium">{line.item?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{line.description || "-"}</TableCell>
                      <TableCell className="text-right">{Number(line.quantity)}</TableCell>
                      <TableCell className="text-right">
                        <span className={Number(line.quantityReceived) >= Number(line.quantity) ? "text-green-600" : ""}>
                          {Number(line.quantityReceived || 0)}
                        </span>
                      </TableCell>
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
                  <span>${Number(order.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number(order.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipts */}
          {order.receipts && order.receipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Receipts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">RECEIPT #</TableHead>
                      <TableHead className="font-bold">DATE</TableHead>
                      <TableHead className="font-bold">STATUS</TableHead>
                      <TableHead className="font-bold text-right">ITEMS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.receipts.map((receipt: any) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                        <TableCell>{new Date(receipt.receiptDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {receipt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{receipt.lines?.length || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Memo */}
          {order.memo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Memo</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.memo}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Vendor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Link href={`/purchasing/vendors/${order.vendor.id}`} className="font-medium text-primary hover:underline">
                  {order.vendor.companyName}
                </Link>
                <p className="text-sm text-muted-foreground">{order.vendor.vendorId}</p>
              </div>
              {order.vendor.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${order.vendor.email}`} className="text-primary hover:underline">
                    {order.vendor.email}
                  </a>
                </div>
              )}
              {order.vendor.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{order.vendor.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p>{new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Receipt</p>
                <p className={order.expectedReceiptDate && new Date(order.expectedReceiptDate) < new Date() && order.status !== "received" && order.status !== "closed" ? "text-red-600" : ""}>
                  {order.expectedReceiptDate ? new Date(order.expectedReceiptDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p>{order.currency?.code} - {order.currency?.name}</p>
              </div>
              {order.vendorRefNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendor Ref #</p>
                  <p>{order.vendorRefNumber}</p>
                </div>
              )}
              {order.shipToWarehouse && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ship To</p>
                  <p>{order.shipToWarehouse.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Created By */}
          {order.createdBy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">{order.createdBy.email}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Items</DialogTitle>
            <DialogDescription>
              This will create an item receipt for all items on {order.poNumber} and mark them as received.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleReceive} disabled={isProcessing} className="bg-primary hover:bg-blue-600">
              {isProcessing ? "Processing..." : "Receive All Items"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Purchase Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to close {order.poNumber}? This will prevent any further changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleClose} disabled={isProcessing}>
              {isProcessing ? "Closing..." : "Close PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Purchase Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {order.poNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isProcessing}>
              Keep PO
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isProcessing}>
              {isProcessing ? "Cancelling..." : "Cancel PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
