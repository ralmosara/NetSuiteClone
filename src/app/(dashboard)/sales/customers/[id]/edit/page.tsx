"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customer, isLoading, error } = trpc.customers.getCustomer.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const [formData, setFormData] = useState({
    companyName: "",
    displayName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingPostal: "",
    shippingAddress1: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingState: "",
    shippingCountry: "",
    shippingPostal: "",
    creditLimit: "",
    paymentTerms: "net30",
    taxExempt: false,
    taxNumber: "",
    status: "active",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        companyName: customer.companyName || "",
        displayName: customer.displayName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        website: customer.website || "",
        industry: customer.industry || "",
        billingAddress1: customer.billingAddress1 || "",
        billingAddress2: customer.billingAddress2 || "",
        billingCity: customer.billingCity || "",
        billingState: customer.billingState || "",
        billingCountry: customer.billingCountry || "",
        billingPostal: customer.billingPostal || "",
        shippingAddress1: customer.shippingAddress1 || "",
        shippingAddress2: customer.shippingAddress2 || "",
        shippingCity: customer.shippingCity || "",
        shippingState: customer.shippingState || "",
        shippingCountry: customer.shippingCountry || "",
        shippingPostal: customer.shippingPostal || "",
        creditLimit: customer.creditLimit?.toString() || "",
        paymentTerms: customer.paymentTerms || "net30",
        taxExempt: customer.taxExempt || false,
        taxNumber: customer.taxNumber || "",
        status: customer.status || "active",
      });
    }
  }, [customer]);

  const updateCustomer = trpc.customers.updateCustomer.useMutation({
    onSuccess: () => {
      toast({ title: "Customer updated", description: "Customer has been updated successfully." });
      router.push(`/sales/customers/${params.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({ title: "Validation Error", description: "Please fix the errors before submitting.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    updateCustomer.mutate({
      id: params.id as string,
      ...formData,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const copyBillingToShipping = () => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress1: prev.billingAddress1,
      shippingAddress2: prev.billingAddress2,
      shippingCity: prev.billingCity,
      shippingState: prev.billingState,
      shippingCountry: prev.billingCountry,
      shippingPostal: prev.billingPostal,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Customers", href: "/sales/customers" },
          { label: customer.companyName || "Customer", href: `/sales/customers/${customer.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Edit Customer
          </h1>
          <p className="text-muted-foreground mt-1">{customer.customerId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Enter company name"
                  className={errors.companyName ? "border-destructive" : ""}
                />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  placeholder="Display name (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@company.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => handleChange("industry", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={formData.paymentTerms} onValueChange={(v) => handleChange("paymentTerms", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net45">Net 45</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => handleChange("creditLimit", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Number</Label>
                  <Input
                    id="taxNumber"
                    value={formData.taxNumber}
                    onChange={(e) => handleChange("taxNumber", e.target.value)}
                    placeholder="Tax ID / VAT Number"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="taxExempt"
                    checked={formData.taxExempt}
                    onChange={(e) => handleChange("taxExempt", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="taxExempt">Tax Exempt</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input
                  value={formData.billingAddress1}
                  onChange={(e) => handleChange("billingAddress1", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input
                  value={formData.billingAddress2}
                  onChange={(e) => handleChange("billingAddress2", e.target.value)}
                  placeholder="Apt, suite, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.billingCity}
                    onChange={(e) => handleChange("billingCity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input
                    value={formData.billingState}
                    onChange={(e) => handleChange("billingState", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.billingCountry}
                    onChange={(e) => handleChange("billingCountry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.billingPostal}
                    onChange={(e) => handleChange("billingPostal", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Shipping Address</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={copyBillingToShipping}>
                Copy from Billing
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input
                  value={formData.shippingAddress1}
                  onChange={(e) => handleChange("shippingAddress1", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input
                  value={formData.shippingAddress2}
                  onChange={(e) => handleChange("shippingAddress2", e.target.value)}
                  placeholder="Apt, suite, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.shippingCity}
                    onChange={(e) => handleChange("shippingCity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input
                    value={formData.shippingState}
                    onChange={(e) => handleChange("shippingState", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.shippingCountry}
                    onChange={(e) => handleChange("shippingCountry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.shippingPostal}
                    onChange={(e) => handleChange("shippingPostal", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.push(`/sales/customers/${params.id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-blue-600">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
