"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

interface LineItem {
  id: string;
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: "",
    currencyId: "",
    shipToWarehouseId: "",
    expectedReceiptDate: "",
    memo: "",
    vendorRefNumber: "",
  });

  const [lines, setLines] = useState<LineItem[]>([]);
  const [newLine, setNewLine] = useState({
    itemId: "",
    quantity: 1,
  });

  // Fetch the existing order
  const { data: order, isLoading, error } = trpc.purchasing.getPurchaseOrder.useQuery(
    { id: orderId },
    { enabled: !!orderId }
  );

  // Fetch reference data
  const { data: vendorsData } = trpc.purchasing.getVendors.useQuery({ limit: 100 });
  const { data: itemsData } = trpc.inventory.getItems.useQuery({ limit: 100 });
  const { data: currencies } = trpc.finance.getCurrencies.useQuery();
  const { data: warehousesData } = trpc.inventory.getWarehouses.useQuery({});

  const utils = trpc.useUtils();

  // Initialize form when order data loads
  useEffect(() => {
    if (order && !initialized) {
      setFormData({
        vendorId: order.vendorId,
        currencyId: order.currencyId,
        shipToWarehouseId: order.shipToWarehouseId || "",
        expectedReceiptDate: order.expectedReceiptDate
          ? new Date(order.expectedReceiptDate).toISOString().split("T")[0]
          : "",
        memo: order.memo || "",
        vendorRefNumber: order.vendorRefNumber || "",
      });

      setLines(
        order.lines.map((line: any) => ({
          id: line.id,
          itemId: line.itemId,
          itemName: line.item?.name || "Unknown Item",
          description: line.description || "",
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
          amount: Number(line.amount),
        }))
      );

      setInitialized(true);
    }
  }, [order, initialized]);

  const updatePO = trpc.purchasing.updatePurchaseOrder.useMutation({
    onSuccess: (data) => {
      toast({ title: "Purchase order updated", description: `${data.poNumber} has been updated.` });
      utils.purchasing.getPurchaseOrder.invalidate({ id: orderId });
      utils.purchasing.getPurchaseOrders.invalidate();
      router.push(`/purchasing/orders/${orderId}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const isDraft = order?.status === "draft" || order?.status === "pending_approval";

  const addLine = () => {
    if (!newLine.itemId) {
      toast({ title: "Error", description: "Please select an item", variant: "destructive" });
      return;
    }

    const item = itemsData?.items?.find((i: any) => i.id === newLine.itemId);
    if (!item) return;

    const unitPrice = Number(item.basePrice) || 0;
    const amount = newLine.quantity * unitPrice;

    setLines([
      ...lines,
      {
        id: `new-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        description: item.description || "",
        quantity: newLine.quantity,
        unitPrice,
        amount,
      },
    ]);

    setNewLine({ itemId: "", quantity: 1 });
  };

  const updateLineQuantity = (lineId: string, quantity: number) => {
    setLines(
      lines.map((line) =>
        line.id === lineId
          ? { ...line, quantity, amount: quantity * line.unitPrice }
          : line
      )
    );
  };

  const updateLinePrice = (lineId: string, unitPrice: number) => {
    setLines(
      lines.map((line) =>
        line.id === lineId
          ? { ...line, unitPrice, amount: line.quantity * unitPrice }
          : line
      )
    );
  };

  const removeLine = (lineId: string) => {
    setLines(lines.filter((line) => line.id !== lineId));
  };

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  const handleSubmit = () => {
    if (isDraft) {
      if (!formData.vendorId) {
        toast({ title: "Error", description: "Please select a vendor", variant: "destructive" });
        return;
      }
      if (!formData.currencyId) {
        toast({ title: "Error", description: "Please select a currency", variant: "destructive" });
        return;
      }
      if (lines.length === 0) {
        toast({ title: "Error", description: "Please add at least one line item", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);

    const payload: any = {
      id: orderId,
      memo: formData.memo || null,
      vendorRefNumber: formData.vendorRefNumber || null,
      expectedReceiptDate: formData.expectedReceiptDate
        ? new Date(formData.expectedReceiptDate)
        : null,
    };

    // Only send full edit fields for draft POs
    if (isDraft) {
      payload.vendorId = formData.vendorId;
      payload.currencyId = formData.currencyId;
      payload.shipToWarehouseId = formData.shipToWarehouseId || null;
      payload.lines = lines.map((line) => ({
        itemId: line.itemId,
        description: line.description || undefined,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      }));
    }

    updatePO.mutate(payload);
  };

  const selectedCurrency = currencies?.find((c: any) => c.id === formData.currencyId);
  const currencySymbol = selectedCurrency?.symbol || "$";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Purchase Order Not Found</h2>
        <p className="text-muted-foreground mb-4">The purchase order you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/purchasing/orders">
          <Button>Back to Purchase Orders</Button>
        </Link>
      </div>
    );
  }

  if (order.status === "closed" || order.status === "cancelled") {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Purchasing", href: "/purchasing" },
            { label: "Orders", href: "/purchasing/orders" },
            { label: order.poNumber, href: `/purchasing/orders/${orderId}` },
            { label: "Edit" },
          ]}
        />
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">lock</span>
          <h2 className="text-xl font-semibold mb-2">Cannot Edit This Order</h2>
          <p className="text-muted-foreground mb-4">
            {order.poNumber} is {order.status} and cannot be edited.
          </p>
          <Link href={`/purchasing/orders/${orderId}`}>
            <Button variant="outline">View Order</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Orders", href: "/purchasing/orders" },
          { label: order.poNumber, href: `/purchasing/orders/${orderId}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Edit {order.poNumber}
            </h1>
            <Badge
              variant="outline"
              className={
                order.status === "draft"
                  ? "bg-slate-100 text-slate-800 border-slate-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }
            >
              {order.status === "draft" ? "Draft" : order.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {isDraft
              ? "Edit all order details including line items."
              : "Only memo, vendor reference, and expected date can be changed."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/purchasing/orders/${orderId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select
                    value={formData.vendorId}
                    onValueChange={(v) => setFormData({ ...formData, vendorId: v })}
                    disabled={!isDraft}
                  >
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorsData?.vendors?.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendorRef">Vendor Reference</Label>
                  <Input
                    id="vendorRef"
                    placeholder="Vendor's reference number"
                    value={formData.vendorRefNumber}
                    onChange={(e) => setFormData({ ...formData, vendorRefNumber: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Ship To Warehouse</Label>
                  <Select
                    value={formData.shipToWarehouseId}
                    onValueChange={(v) => setFormData({ ...formData, shipToWarehouseId: v })}
                    disabled={!isDraft}
                  >
                    <SelectTrigger id="warehouse">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehousesData?.warehouses?.map((wh: any) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Expected Receipt Date</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={formData.expectedReceiptDate}
                    onChange={(e) => setFormData({ ...formData, expectedReceiptDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currencyId}
                    onValueChange={(v) => setFormData({ ...formData, currencyId: v })}
                    disabled={!isDraft}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Textarea
                  id="memo"
                  placeholder="Internal notes for this order"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Line Form - only for draft POs */}
              {isDraft && (
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Item</Label>
                    <Select value={newLine.itemId} onValueChange={(v) => setNewLine({ ...newLine, itemId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemsData?.items?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.itemId} - {item.name} - ${Number(item.basePrice).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newLine.quantity}
                      onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <Button type="button" onClick={addLine} variant="outline">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </Button>
                </div>
              )}

              {/* Lines Table */}
              {lines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">ITEM</TableHead>
                      <TableHead className="font-bold w-24">QTY</TableHead>
                      <TableHead className="font-bold w-32">UNIT PRICE</TableHead>
                      <TableHead className="font-bold text-right w-32">AMOUNT</TableHead>
                      {isDraft && <TableHead className="w-12"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <p className="font-medium">{line.itemName}</p>
                          {line.description && (
                            <p className="text-xs text-muted-foreground">{line.description}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {isDraft ? (
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => updateLineQuantity(line.id, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          ) : (
                            <span>{line.quantity}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isDraft ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) => updateLinePrice(line.id, parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          ) : (
                            <span>{currencySymbol}{line.unitPrice.toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {currencySymbol}{line.amount.toFixed(2)}
                        </TableCell>
                        {isDraft && (
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeLine(line.id)}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">shopping_cart</span>
                  <p>No items on this order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lines.length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span>{lines.reduce((sum, l) => sum + l.quantity, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Subtotal</span>
                  <span className="text-primary">
                    {currencySymbol}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-blue-600"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/purchasing/orders/${orderId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
