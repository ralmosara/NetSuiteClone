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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    isPrimary: false,
  });
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const { data: customer, isLoading, error } = trpc.customers.getCustomer.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const deleteCustomer = trpc.customers.deleteCustomer.useMutation({
    onSuccess: () => {
      toast({ title: "Customer deleted", description: "Customer has been deleted successfully." });
      router.push("/sales/customers");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteCustomer.mutate({ id: params.id as string });
  };

  const utils = trpc.useUtils();

  const createContact = trpc.customers.createContact.useMutation({
    onSuccess: () => {
      toast({ title: "Contact added", description: "Contact has been added successfully." });
      utils.customers.getCustomer.invalidate({ id: params.id as string });
      resetContactForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const updateContact = trpc.customers.updateContact.useMutation({
    onSuccess: () => {
      toast({ title: "Contact updated", description: "Contact has been updated successfully." });
      utils.customers.getCustomer.invalidate({ id: params.id as string });
      resetContactForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const deleteContact = trpc.customers.deleteContact.useMutation({
    onSuccess: () => {
      toast({ title: "Contact deleted", description: "Contact has been deleted successfully." });
      utils.customers.getCustomer.invalidate({ id: params.id as string });
      setDeleteContactId(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const resetContactForm = () => {
    setContactDialogOpen(false);
    setEditingContact(null);
    setContactForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      isPrimary: false,
    });
  };

  const openAddContact = () => {
    resetContactForm();
    setContactDialogOpen(true);
  };

  const openEditContact = (contact: any) => {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      jobTitle: contact.jobTitle || "",
      isPrimary: contact.isPrimary || false,
    });
    setContactDialogOpen(true);
  };

  const handleContactSubmit = () => {
    if (!contactForm.firstName.trim() || !contactForm.lastName.trim()) {
      toast({ title: "Validation Error", description: "First name and last name are required.", variant: "destructive" });
      return;
    }

    if (editingContact) {
      updateContact.mutate({
        id: editingContact.id,
        ...contactForm,
        email: contactForm.email || null,
        phone: contactForm.phone || null,
        jobTitle: contactForm.jobTitle || null,
      });
    } else {
      createContact.mutate({
        customerId: params.id as string,
        ...contactForm,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Sales", href: "/sales" },
            { label: "Customers", href: "/sales/customers" },
            { label: "Not Found" },
          ]}
        />
        <Card className="p-12 text-center">
          <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">
            person_off
          </span>
          <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The customer you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push("/sales/customers")}>
            Back to Customers
          </Button>
        </Card>
      </div>
    );
  }

  const statusColor = customer.status === "active"
    ? "bg-green-100 text-green-800 border-green-200"
    : customer.status === "inactive"
    ? "bg-slate-100 text-slate-800 border-slate-200"
    : "bg-yellow-100 text-yellow-800 border-yellow-200";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Customers", href: "/sales/customers" },
          { label: customer.companyName || customer.displayName || "Customer" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[32px]">
              business
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {customer.companyName || customer.displayName}
              </h1>
              <Badge variant="outline" className={statusColor}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {customer.customerId} {customer.industry && `• ${customer.industry}`}
            </p>
          </div>
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
              <DropdownMenuItem onClick={() => router.push(`/sales/customers/${customer.id}/edit`)}>
                <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/sales/invoices/new?customerId=${customer.id}`)}>
                <span className="material-symbols-outlined text-[18px] mr-2">receipt</span>
                Create Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/sales/quotes/new?customerId=${customer.id}`)}>
                <span className="material-symbols-outlined text-[18px] mr-2">request_quote</span>
                Create Quote
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">delete</span>
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/sales/orders/new?customerId=${customer.id}`}>
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${Number(customer.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Open Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${Number(customer.creditLimit || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Credit Limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {customer.salesOrders?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              {customer.contacts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    contact_mail
                  </span>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Email</p>
                    <p className="font-medium">{customer.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Phone</p>
                    <p className="font-medium">{customer.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Website</p>
                    {customer.website ? (
                      <a href={customer.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                        {customer.website}
                      </a>
                    ) : (
                      <p className="font-medium">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Industry</p>
                    <p className="font-medium">{customer.industry || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    account_balance
                  </span>
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Payment Terms</p>
                    <p className="font-medium">{customer.paymentTerms || "Net 30"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Tax Exempt</p>
                    <p className="font-medium">{customer.taxExempt ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Credit Limit</p>
                    <p className="font-medium">${Number(customer.creditLimit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Available Credit</p>
                    <p className="font-medium text-green-600">
                      ${(Number(customer.creditLimit || 0) - Number(customer.balance || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    receipt
                  </span>
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.billingAddress1 ? (
                  <>
                    <p className="font-medium">{customer.billingAddress1}</p>
                    {customer.billingAddress2 && <p className="font-medium">{customer.billingAddress2}</p>}
                    <p className="text-muted-foreground">
                      {customer.billingCity}{customer.billingCity && customer.billingState ? ", " : ""}{customer.billingState} {customer.billingPostal}
                    </p>
                    <p className="text-muted-foreground">{customer.billingCountry}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No billing address</p>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    local_shipping
                  </span>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.shippingAddress1 ? (
                  <>
                    <p className="font-medium">{customer.shippingAddress1}</p>
                    {customer.shippingAddress2 && <p className="font-medium">{customer.shippingAddress2}</p>}
                    <p className="text-muted-foreground">
                      {customer.shippingCity}{customer.shippingCity && customer.shippingState ? ", " : ""}{customer.shippingState} {customer.shippingPostal}
                    </p>
                    <p className="text-muted-foreground">{customer.shippingCountry}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No shipping address</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Link href={`/sales/orders?customerId=${customer.id}`}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {customer.salesOrders && customer.salesOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">ORDER</TableHead>
                      <TableHead className="font-bold">DATE</TableHead>
                      <TableHead className="font-bold">STATUS</TableHead>
                      <TableHead className="font-bold text-right">TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.salesOrders.slice(0, 10).map((order: any) => (
                      <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell>
                          <Link href={`/sales/orders/${order.id}`} className="font-medium text-primary hover:underline">
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">receipt_long</span>
                  <p>No orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contacts</CardTitle>
              <Button size="sm" className="bg-primary hover:bg-blue-600" onClick={openAddContact}>
                <span className="material-symbols-outlined text-[18px] mr-2">person_add</span>
                Add Contact
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {customer.contacts && customer.contacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">NAME</TableHead>
                      <TableHead className="font-bold">TITLE</TableHead>
                      <TableHead className="font-bold">EMAIL</TableHead>
                      <TableHead className="font-bold">PHONE</TableHead>
                      <TableHead className="font-bold text-center">PRIMARY</TableHead>
                      <TableHead className="font-bold text-center">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.contacts.map((contact: any) => (
                      <TableRow key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>{contact.jobTitle || "-"}</TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                              {contact.email}
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{contact.phone || "-"}</TableCell>
                        <TableCell className="text-center">
                          {contact.isPrimary && (
                            <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditContact(contact)}>
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteContactId(contact.id)}>
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">group</span>
                  <p>No contacts added yet</p>
                  <Button variant="outline" className="mt-4" onClick={openAddContact}>
                    <span className="material-symbols-outlined text-[18px] mr-2">person_add</span>
                    Add First Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {customer.companyName}? This action cannot be undone.
              {(customer.salesOrders?.length || 0) > 0 || (customer.invoices?.length || 0) > 0 ? (
                <span className="block mt-2 text-amber-600">
                  Note: Customers with existing orders or invoices cannot be deleted. Consider archiving instead.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={(open) => !open && resetContactForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
            <DialogDescription>
              {editingContact ? "Update the contact information below." : "Add a new contact for this customer."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={contactForm.jobTitle}
                onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                placeholder="Sales Manager"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={contactForm.isPrimary}
                onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPrimary" className="text-sm font-normal">Set as primary contact</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetContactForm}>Cancel</Button>
            <Button
              onClick={handleContactSubmit}
              disabled={createContact.isPending || updateContact.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {createContact.isPending || updateContact.isPending
                ? "Saving..."
                : editingContact
                ? "Update Contact"
                : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Confirmation */}
      <Dialog open={!!deleteContactId} onOpenChange={(open) => !open && setDeleteContactId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteContactId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteContactId && deleteContact.mutate({ id: deleteContactId })}
              disabled={deleteContact.isPending}
            >
              {deleteContact.isPending ? "Deleting..." : "Delete Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
