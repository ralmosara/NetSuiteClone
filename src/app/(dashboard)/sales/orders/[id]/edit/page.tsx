"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

const shippingMethodOptions = [
  { value: "standard", label: "Standard Shipping" },
  { value: "express", label: "Express Shipping" },
  { value: "overnight", label: "Overnight" },
  { value: "pickup", label: "Customer Pickup" },
];

export default function EditSalesOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: order, isLoading, error } = trpc.sales.getSalesOrder.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const [formData, setFormData] = useState({
    expectedShipDate: "",
    shippingMethod: "",
    shippingCost: 0,
    memo: "",
    internalNotes: "",
    shipToAddress1: "",
    shipToAddress2: "",
    shipToCity: "",
    shipToState: "",
    shipToCountry: "",
    shipToPostal: "",
  });

  // Populate form when order data loads
  useEffect(() => {
    if (order) {
      setFormData({
        expectedShipDate: order.expectedShipDate
          ? new Date(order.expectedShipDate).toISOString().split("T")[0]
          : "",
        shippingMethod: order.shippingMethod || "",
        shippingCost: Number(order.shippingCost) || 0,
        memo: order.memo || "",
        internalNotes: order.internalNotes || "",
        shipToAddress1: order.shipToAddress1 || "",
        shipToAddress2: order.shipToAddress2 || "",
        shipToCity: order.shipToCity || "",
        shipToState: order.shipToState || "",
        shipToCountry: order.shipToCountry || "",
        shipToPostal: order.shipToPostal || "",
      });
    }
  }, [order]);

  const updateOrderMutation = trpc.sales.updateSalesOrder.useMutation({
    onSuccess: () => {
      router.push(`/sales/orders/${params.id}`);
    },
    onError: (error) => {
      alert(`Error updating order: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateOrderMutation.mutate({
      id: params.id as string,
      expectedShipDate: formData.expectedShipDate ? new Date(formData.expectedShipDate) : undefined,
      shippingMethod: formData.shippingMethod || undefined,
      shippingCost: formData.shippingCost,
      memo: formData.memo || undefined,
      internalNotes: formData.internalNotes || undefined,
      shipToAddress1: formData.shipToAddress1 || undefined,
      shipToAddress2: formData.shipToAddress2 || undefined,
      shipToCity: formData.shipToCity || undefined,
      shipToState: formData.shipToState || undefined,
      shipToCountry: formData.shipToCountry || undefined,
      shipToPostal: formData.shipToPostal || undefined,
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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Orders", href: "/sales/orders" },
          { label: order.orderNumber, href: `/sales/orders/${order.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Edit {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            Update order details and shipping information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Number</p>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{order.customer?.companyName || order.customer?.displayName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Line 1</Label>
                    <Input
                      value={formData.shipToAddress1}
                      onChange={(e) => setFormData({ ...formData, shipToAddress1: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 2</Label>
                    <Input
                      value={formData.shipToAddress2}
                      onChange={(e) => setFormData({ ...formData, shipToAddress2: e.target.value })}
                      placeholder="Apt, suite, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.shipToCity}
                      onChange={(e) => setFormData({ ...formData, shipToCity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={formData.shipToState}
                      onChange={(e) => setFormData({ ...formData, shipToState: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={formData.shipToPostal}
                      onChange={(e) => setFormData({ ...formData, shipToPostal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={formData.shipToCountry}
                      onChange={(e) => setFormData({ ...formData, shipToCountry: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Memo (visible to customer)</Label>
                  <Textarea
                    placeholder="Add notes visible on the order..."
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea
                    placeholder="Internal notes (not visible to customer)..."
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Expected Ship Date</Label>
                  <Input
                    type="date"
                    value={formData.expectedShipDate}
                    onChange={(e) => setFormData({ ...formData, expectedShipDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shipping Method</Label>
                  <Select
                    value={formData.shippingMethod}
                    onValueChange={(v) => setFormData({ ...formData, shippingMethod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shipping Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] mr-2 animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] mr-2">save</span>
                    Save Changes
                  </>
                )}
              </Button>
              <Link href={`/sales/orders/${order.id}`}>
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
