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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const getStatusBadge = (status: string) => {
  if (status === "active") {
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
  }
  return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Inactive</Badge>;
};

const getPOStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    pending_approval: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-800 border-blue-200" },
    received: { label: "Received", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: vendor, isLoading, error } = trpc.purchasing.getVendor.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateVendor = trpc.purchasing.updateVendor.useMutation({
    onSuccess: () => {
      toast({ title: "Vendor updated", description: "Vendor status has been updated." });
      utils.purchasing.getVendor.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const deleteVendor = trpc.purchasing.deleteVendor.useMutation({
    onSuccess: () => {
      toast({ title: "Vendor deleted", description: "Vendor has been deleted successfully." });
      router.push("/purchasing/vendors");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    },
  });

  const handleToggleStatus = () => {
    const newStatus = vendor?.status === "active" ? "inactive" : "active";
    updateVendor.mutate({ id: params.id as string, status: newStatus });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteVendor.mutate({ id: params.id as string });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Vendor Not Found</h2>
        <p className="text-muted-foreground mb-4">The vendor you're looking for doesn't exist.</p>
        <Link href="/purchasing/vendors">
          <Button>Back to Vendors</Button>
        </Link>
      </div>
    );
  }

  const totalPOs = vendor.purchaseOrders?.length || 0;
  const totalBills = vendor.vendorBills?.length || 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Vendors", href: "/purchasing/vendors" },
          { label: vendor.companyName },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {vendor.companyName}
            </h1>
            {getStatusBadge(vendor.status)}
          </div>
          <p className="text-muted-foreground mt-1">{vendor.vendorId}</p>
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
              <DropdownMenuItem onClick={handleToggleStatus}>
                <span className="material-symbols-outlined text-[18px] mr-2">
                  {vendor.status === "active" ? "block" : "check_circle"}
                </span>
                {vendor.status === "active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">delete</span>
                Delete Vendor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/purchasing/vendors/${vendor.id}/edit`}>
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
          <Link href={`/purchasing/orders/new?vendorId=${vendor.id}`}>
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New PO
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{totalPOs}</div>
            <p className="text-xs text-muted-foreground">Purchase Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{totalBills}</div>
            <p className="text-xs text-muted-foreground">Vendor Bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">{vendor.paymentTerms || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Payment Terms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{vendor.currency?.code || "USD"}</div>
            <p className="text-xs text-muted-foreground">Currency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
              <TabsTrigger value="bills">Vendor Bills</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {vendor.purchaseOrders && vendor.purchaseOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                          <TableHead className="font-bold">PO #</TableHead>
                          <TableHead className="font-bold">DATE</TableHead>
                          <TableHead className="font-bold">STATUS</TableHead>
                          <TableHead className="font-bold text-right">TOTAL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendor.purchaseOrders.map((po: any) => (
                          <TableRow key={po.id}>
                            <TableCell>
                              <Link href={`/purchasing/orders/${po.id}`} className="font-medium text-primary hover:underline">
                                {po.poNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(po.orderDate || po.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getPOStatusBadge(po.status)}</TableCell>
                            <TableCell className="text-right font-bold">
                              ${Number(po.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
                      <p>No purchase orders yet</p>
                      <Link href={`/purchasing/orders/new?vendorId=${vendor.id}`}>
                        <Button className="mt-4" variant="outline">
                          Create First PO
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Vendor Bills</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {vendor.vendorBills && vendor.vendorBills.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                          <TableHead className="font-bold">BILL #</TableHead>
                          <TableHead className="font-bold">DATE</TableHead>
                          <TableHead className="font-bold">DUE DATE</TableHead>
                          <TableHead className="font-bold text-right">AMOUNT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendor.vendorBills.map((bill: any) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-medium">{bill.billNumber}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(bill.billDate || bill.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              ${Number(bill.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-[48px] mb-2">receipt_long</span>
                      <p>No vendor bills yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.displayName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                  <p>{vendor.displayName}</p>
                </div>
              )}
              {vendor.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{vendor.phone}</p>
                </div>
              )}
              {vendor.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {vendor.website}
                  </a>
                </div>
              )}
              {!vendor.email && !vendor.phone && !vendor.website && (
                <p className="text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.address1 || vendor.city || vendor.country ? (
                <div className="space-y-1">
                  {vendor.address1 && <p>{vendor.address1}</p>}
                  {vendor.address2 && <p>{vendor.address2}</p>}
                  {(vendor.city || vendor.state || vendor.postalCode) && (
                    <p>
                      {[vendor.city, vendor.state, vendor.postalCode].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {vendor.country && <p>{vendor.country}</p>}
                </div>
              ) : (
                <p className="text-muted-foreground">No address on file</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
                <p>{vendor.paymentTerms || "Not specified"}</p>
              </div>
              {vendor.taxNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tax ID / VAT</p>
                  <p>{vendor.taxNumber}</p>
                </div>
              )}
              {vendor.bankName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank</p>
                  <p>{vendor.bankName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {vendor.companyName}? This action cannot be undone.
              {(totalPOs > 0 || totalBills > 0) && (
                <span className="block mt-2 text-amber-600">
                  Note: Vendors with existing purchase orders or bills cannot be deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
