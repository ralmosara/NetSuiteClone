"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    pending_approval: { label: "Pending Approval", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    pending_fulfillment: { label: "Pending Fulfillment", className: "bg-blue-100 text-blue-800 border-blue-200" },
    fulfilled: { label: "Fulfilled", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const statusTransitions: Record<string, { label: string; nextStatus: string; icon: string }[]> = {
  draft: [
    { label: "Submit for Approval", nextStatus: "pending_approval", icon: "send" },
  ],
  pending_approval: [
    { label: "Approve Order", nextStatus: "approved", icon: "check_circle" },
    { label: "Reject Order", nextStatus: "cancelled", icon: "cancel" },
  ],
  approved: [
    { label: "Mark Ready for Fulfillment", nextStatus: "pending_fulfillment", icon: "local_shipping" },
  ],
  pending_fulfillment: [
    { label: "Mark as Fulfilled", nextStatus: "fulfilled", icon: "check_circle" },
  ],
  fulfilled: [
    { label: "Close Order", nextStatus: "closed", icon: "archive" },
  ],
};

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: order, isLoading, error, refetch } = trpc.sales.getSalesOrder.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const updateOrderMutation = trpc.sales.updateSalesOrder.useMutation({
    onSuccess: () => {
      refetch();
      setIsUpdating(false);
    },
    onError: (error) => {
      alert(`Error updating order: ${error.message}`);
      setIsUpdating(false);
    },
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    updateOrderMutation.mutate({
      id: order.id,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading order: {error?.message || "Order not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/sales/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const availableTransitions = statusTransitions[order.status] || [];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Orders", href: "/sales/orders" },
          { label: order.orderNumber },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {order.orderNumber}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            Created {new Date(order.orderDate).toLocaleDateString()} • {order.createdBy?.name || "System"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <span className="material-symbols-outlined text-[18px] mr-2">print</span>
            Print
          </Button>
          <Link href={`/sales/orders/${order.id}/edit`}>
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
          {availableTransitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-blue-600" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] mr-2 animate-spin">progress_activity</span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px] mr-2">arrow_forward</span>
                      Update Status
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableTransitions.map((transition) => (
                  <DropdownMenuItem
                    key={transition.nextStatus}
                    onClick={() => handleStatusChange(transition.nextStatus)}
                  >
                    <span className="material-symbols-outlined text-[18px] mr-2">{transition.icon}</span>
                    {transition.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Line Items ({order.lines?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">ITEM</TableHead>
                    <TableHead className="font-bold text-center">QTY</TableHead>
                    <TableHead className="font-bold text-right">UNIT PRICE</TableHead>
                    <TableHead className="font-bold text-right">DISCOUNT</TableHead>
                    <TableHead className="font-bold text-right">AMOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lines?.map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <div>
                          <Link href={`/inventory/items/${line.item?.id}`} className="font-medium text-primary hover:underline">
                            {line.item?.itemId || line.itemId}
                          </Link>
                          <p className="text-xs text-muted-foreground">{line.description || line.item?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{line.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${Number(line.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {Number(line.discountPercent) > 0 ? `-${line.discountPercent}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${Number(line.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="border-t p-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(order.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-red-600">-${Number(order.discountAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number(order.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {Number(order.shippingCost) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${Number(order.shippingCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">receipt</span>
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.customer?.companyName || order.customer?.displayName}</p>
                {order.customer?.billingAddress1 && (
                  <>
                    <p className="text-muted-foreground">{order.customer.billingAddress1}</p>
                    {order.customer.billingAddress2 && <p className="text-muted-foreground">{order.customer.billingAddress2}</p>}
                    <p className="text-muted-foreground">
                      {order.customer.billingCity}, {order.customer.billingState} {order.customer.billingPostal}
                    </p>
                    <p className="text-muted-foreground">{order.customer.billingCountry}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.customer?.companyName || order.customer?.displayName}</p>
                {order.shipToAddress1 ? (
                  <>
                    <p className="text-muted-foreground">{order.shipToAddress1}</p>
                    {order.shipToAddress2 && <p className="text-muted-foreground">{order.shipToAddress2}</p>}
                    <p className="text-muted-foreground">
                      {order.shipToCity}, {order.shipToState} {order.shipToPostal}
                    </p>
                    <p className="text-muted-foreground">{order.shipToCountry}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">Same as billing address</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Related Documents */}
          {(order.invoices?.length > 0 || order.fulfillments?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.invoices?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Invoices</h4>
                    <div className="space-y-2">
                      {order.invoices.map((inv: any) => (
                        <Link
                          key={inv.id}
                          href={`/sales/invoices/${inv.id}`}
                          className="flex items-center justify-between p-2 rounded border hover:bg-slate-50"
                        >
                          <span className="font-medium text-primary">{inv.invoiceNumber}</span>
                          <span className="text-muted-foreground">${Number(inv.total).toLocaleString()}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {order.fulfillments?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Fulfillments</h4>
                    <div className="space-y-2">
                      {order.fulfillments.map((ful: any) => (
                        <div
                          key={ful.id}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <span className="font-medium">{ful.fulfillmentNumber || ful.id}</span>
                          <Badge variant="outline">{ful.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">business</span>
                </div>
                <div>
                  <Link href={`/sales/customers/${order.customer?.id}`} className="font-medium text-primary hover:underline">
                    {order.customer?.companyName || order.customer?.displayName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{order.customer?.customerId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {order.customer?.email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted-foreground">mail</span>
                    <span>{order.customer.email}</span>
                  </div>
                )}
                {order.customer?.phone && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted-foreground">phone</span>
                    <span>{order.customer.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Order Date</p>
                  <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                {order.expectedShipDate && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Expected Ship</p>
                    <p className="font-medium">{new Date(order.expectedShipDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Currency</p>
                  <p className="font-medium">{order.currency?.code || "USD"}</p>
                </div>
                {order.shippingMethod && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Shipping Method</p>
                    <p className="font-medium">{order.shippingMethod}</p>
                  </div>
                )}
                {order.memo && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase">Memo</p>
                    <p className="font-medium">{order.memo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/sales/invoices/new?orderId=${order.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <span className="material-symbols-outlined text-[18px] mr-2">receipt</span>
                  Create Invoice
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <span className="material-symbols-outlined text-[18px] mr-2">content_copy</span>
                Duplicate Order
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <span className="material-symbols-outlined text-[18px] mr-2">mail</span>
                Email Customer
              </Button>
              {order.status !== "cancelled" && order.status !== "closed" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                      <span className="material-symbols-outlined text-[18px] mr-2">cancel</span>
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, keep order</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleStatusChange("cancelled")}
                      >
                        Yes, cancel order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
