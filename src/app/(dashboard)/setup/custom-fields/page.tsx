"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const customFields = [
  {
    id: "cf-1",
    fieldId: "custfield_loyalty_tier",
    label: "Loyalty Tier",
    recordType: "Customer",
    fieldType: "list",
    listValues: ["Bronze", "Silver", "Gold", "Platinum"],
    isMandatory: false,
    showInList: true,
    isActive: true,
  },
  {
    id: "cf-2",
    fieldId: "custfield_account_manager",
    label: "Account Manager",
    recordType: "Customer",
    fieldType: "text",
    listValues: null,
    isMandatory: true,
    showInList: true,
    isActive: true,
  },
  {
    id: "cf-3",
    fieldId: "custfield_contract_end",
    label: "Contract End Date",
    recordType: "Customer",
    fieldType: "date",
    listValues: null,
    isMandatory: false,
    showInList: true,
    isActive: true,
  },
  {
    id: "cf-4",
    fieldId: "itemfield_warranty_months",
    label: "Warranty Period (Months)",
    recordType: "Item",
    fieldType: "number",
    listValues: null,
    isMandatory: false,
    showInList: false,
    isActive: true,
  },
  {
    id: "cf-5",
    fieldId: "itemfield_hazardous",
    label: "Hazardous Material",
    recordType: "Item",
    fieldType: "checkbox",
    listValues: null,
    isMandatory: false,
    showInList: true,
    isActive: true,
  },
  {
    id: "cf-6",
    fieldId: "sofield_po_number",
    label: "Customer PO Number",
    recordType: "Sales Order",
    fieldType: "text",
    listValues: null,
    isMandatory: false,
    showInList: true,
    isActive: true,
  },
  {
    id: "cf-7",
    fieldId: "vendfield_payment_method",
    label: "Preferred Payment Method",
    recordType: "Vendor",
    fieldType: "list",
    listValues: ["Wire Transfer", "ACH", "Check", "Credit Card"],
    isMandatory: false,
    showInList: false,
    isActive: true,
  },
  {
    id: "cf-8",
    fieldId: "empfield_tshirt_size",
    label: "T-Shirt Size",
    recordType: "Employee",
    fieldType: "list",
    listValues: ["XS", "S", "M", "L", "XL", "XXL"],
    isMandatory: false,
    showInList: false,
    isActive: false,
  },
];

const recordTypeOptions = [
  { value: "all", label: "All Record Types" },
  { value: "Customer", label: "Customer" },
  { value: "Vendor", label: "Vendor" },
  { value: "Item", label: "Item" },
  { value: "Sales Order", label: "Sales Order" },
  { value: "Purchase Order", label: "Purchase Order" },
  { value: "Employee", label: "Employee" },
];

const fieldTypeOptions = [
  { value: "text", label: "Text", icon: "text_fields" },
  { value: "number", label: "Number", icon: "numbers" },
  { value: "date", label: "Date", icon: "calendar_today" },
  { value: "list", label: "List/Select", icon: "list" },
  { value: "checkbox", label: "Checkbox", icon: "check_box" },
  { value: "currency", label: "Currency", icon: "attach_money" },
  { value: "textarea", label: "Text Area", icon: "notes" },
];

const getFieldTypeIcon = (type: string) => {
  const field = fieldTypeOptions.find((f) => f.value === type);
  return field?.icon || "text_fields";
};

const getFieldTypeBadge = (type: string) => {
  const field = fieldTypeOptions.find((f) => f.value === type);
  return (
    <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
      <span className="material-symbols-outlined text-[14px] mr-1">{field?.icon}</span>
      {field?.label}
    </Badge>
  );
};

export default function CustomFieldsPage() {
  const [search, setSearch] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");

  const filteredFields = customFields.filter((f) => {
    const matchesSearch =
      f.fieldId.toLowerCase().includes(search.toLowerCase()) ||
      f.label.toLowerCase().includes(search.toLowerCase());
    const matchesType = recordTypeFilter === "all" || f.recordType === recordTypeFilter;
    return matchesSearch && matchesType;
  });

  const fieldsByRecordType = customFields.reduce((acc, field) => {
    acc[field.recordType] = (acc[field.recordType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Custom Fields" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Custom Fields
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage custom fields for any record type.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600">
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          New Custom Field
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{customFields.length}</div>
            <p className="text-xs text-muted-foreground">Total Fields</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {customFields.filter((f) => f.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Fields</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              {Object.keys(fieldsByRecordType).length}
            </div>
            <p className="text-xs text-muted-foreground">Record Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {customFields.filter((f) => f.isMandatory).length}
            </div>
            <p className="text-xs text-muted-foreground">Mandatory Fields</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Field Types Reference */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Field Types</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {fieldTypeOptions.map((type) => (
                <div key={type.value} className="p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-muted-foreground">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fields Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">All Custom Fields</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <Input
                    placeholder="Search fields..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full sm:w-48"
                  />
                </div>
                <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {recordTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">FIELD ID</TableHead>
                  <TableHead className="font-bold">LABEL</TableHead>
                  <TableHead className="font-bold">RECORD TYPE</TableHead>
                  <TableHead className="font-bold">FIELD TYPE</TableHead>
                  <TableHead className="font-bold text-center">MANDATORY</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFields.map((field) => (
                  <TableRow key={field.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {field.fieldId}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{field.recordType}</Badge>
                    </TableCell>
                    <TableCell>{getFieldTypeBadge(field.fieldType)}</TableCell>
                    <TableCell className="text-center">
                      {field.isMandatory ? (
                        <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-300 text-[20px]">remove</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          field.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }
                      >
                        {field.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Usage Info */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Custom Fields by Record Type</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(fieldsByRecordType).map(([type, count]) => (
              <div key={type} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30 text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <p className="text-sm text-muted-foreground">{type}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
