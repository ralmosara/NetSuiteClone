"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const supplierProfile = {
  companyName: "Apple Inc.",
  vendorId: "VEND-001",
  status: "active",
  since: "January 2020",
  primaryContact: {
    name: "John Smith",
    title: "Account Manager",
    email: "john.smith@apple.com",
    phone: "+1 (408) 555-1234",
  },
  address: {
    street: "One Apple Park Way",
    city: "Cupertino",
    state: "CA",
    zip: "95014",
    country: "United States",
  },
  taxInfo: {
    taxId: "94-2404110",
    w9OnFile: true,
    w9Date: "Mar 15, 2023",
  },
  banking: {
    bankName: "Chase Business Banking",
    accountType: "Checking",
    accountNumber: "****4521",
    routingNumber: "****7890",
    verified: true,
  },
  categories: ["Electronics", "Hardware", "Accessories"],
  paymentTerms: "Net 30",
  currency: "USD",
};

const contacts = [
  {
    id: "c-1",
    name: "John Smith",
    title: "Account Manager",
    email: "john.smith@apple.com",
    phone: "+1 (408) 555-1234",
    primary: true,
  },
  {
    id: "c-2",
    name: "Sarah Johnson",
    title: "Finance Director",
    email: "sarah.johnson@apple.com",
    phone: "+1 (408) 555-5678",
    primary: false,
  },
  {
    id: "c-3",
    name: "Mike Chen",
    title: "Logistics Coordinator",
    email: "mike.chen@apple.com",
    phone: "+1 (408) 555-9012",
    primary: false,
  },
];

const documents = [
  { id: "d-1", name: "W-9 Form", type: "Tax Document", uploadDate: "Mar 15, 2023", status: "current" },
  { id: "d-2", name: "Certificate of Insurance", type: "Insurance", uploadDate: "Jan 10, 2023", status: "current" },
  { id: "d-3", name: "Vendor Agreement", type: "Contract", uploadDate: "Jan 5, 2020", status: "current" },
  { id: "d-4", name: "Bank Verification Letter", type: "Banking", uploadDate: "Feb 20, 2023", status: "current" },
];

export default function SupplierProfilePage() {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Company Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your company information and settings.
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-green-600 text-white text-2xl">AP</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">{supplierProfile.companyName}</h2>
                <Badge className="bg-green-100 text-green-800 border-green-200">Active Vendor</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Vendor ID: {supplierProfile.vendorId} &bull; Partner since {supplierProfile.since}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {supplierProfile.categories.map((cat) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                Export Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6 mt-6">
          {/* Company Information */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Company Information</CardTitle>
                <Button variant="ghost" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={supplierProfile.companyName} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor ID</Label>
                    <Input value={supplierProfile.vendorId} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select defaultValue={supplierProfile.paymentTerms} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input value={supplierProfile.currency} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-slate-50 dark:bg-slate-800">
                      {supplierProfile.categories.map((cat) => (
                        <Badge key={cat} variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Business Address</CardTitle>
                <Button variant="ghost" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input value={supplierProfile.address.street} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={supplierProfile.address.city} readOnly />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={supplierProfile.address.state} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input value={supplierProfile.address.zip} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={supplierProfile.address.country} readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tax Information</CardTitle>
                <Button variant="ghost" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Tax ID (EIN)</Label>
                  <Input value={supplierProfile.taxInfo.taxId} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>W-9 Status</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Badge className="bg-green-100 text-green-800 border-green-200">On File</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>W-9 Date</Label>
                  <Input value={supplierProfile.taxInfo.w9Date} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Contact Directory</CardTitle>
                <Button size="sm" className="bg-primary hover:bg-blue-600">
                  <span className="material-symbols-outlined text-[16px] mr-1">add</span>
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-slate-200 text-slate-600">
                              {contact.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{contact.name}</p>
                              {contact.primary && (
                                <Badge variant="secondary" className="text-xs">Primary</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.title}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Bank Account Information</CardTitle>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Update Banking
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">account_balance</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{supplierProfile.banking.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">credit_card</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="font-medium">{supplierProfile.banking.accountType}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">tag</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium font-mono">{supplierProfile.banking.accountNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">route</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Routing Number</p>
                      <p className="font-medium font-mono">{supplierProfile.banking.routingNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600">verified</span>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-400">Bank Account Verified</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your bank account has been verified and is ready to receive payments.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-amber-600">info</span>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    Changing Bank Information
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    For security purposes, changes to banking information require verification.
                    After submitting changes, you'll need to confirm via email and the update will
                    take 3-5 business days to process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Documents & Certifications</CardTitle>
                <Button size="sm" className="bg-primary hover:bg-blue-600">
                  <span className="material-symbols-outlined text-[16px] mr-1">upload</span>
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600">description</span>
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} &bull; Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Current</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Documents Checklist */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Required Documents Checklist</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[
                  { name: "W-9 Form", status: "complete" },
                  { name: "Certificate of Insurance", status: "complete" },
                  { name: "Vendor Agreement (Signed)", status: "complete" },
                  { name: "Bank Verification Letter", status: "complete" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <span className="flex-1">{item.name}</span>
                    <Badge variant="secondary" className="text-xs">Complete</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
