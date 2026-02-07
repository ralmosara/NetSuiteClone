"use client";

import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const savedReports = [
  {
    id: "rpt-1",
    name: "Monthly Sales by Region",
    type: "Sales",
    createdBy: "John Smith",
    lastRun: "Oct 28, 2023",
    schedule: "Monthly",
    shared: true,
  },
  {
    id: "rpt-2",
    name: "Inventory Aging Analysis",
    type: "Inventory",
    createdBy: "Jane Doe",
    lastRun: "Oct 25, 2023",
    schedule: "Weekly",
    shared: true,
  },
  {
    id: "rpt-3",
    name: "AR Aging by Customer",
    type: "Finance",
    createdBy: "John Smith",
    lastRun: "Oct 27, 2023",
    schedule: "Daily",
    shared: false,
  },
  {
    id: "rpt-4",
    name: "Purchase Order Status",
    type: "Purchasing",
    createdBy: "Mike Chen",
    lastRun: "Oct 26, 2023",
    schedule: "On Demand",
    shared: true,
  },
  {
    id: "rpt-5",
    name: "Employee Headcount by Department",
    type: "HR",
    createdBy: "Sarah Johnson",
    lastRun: "Oct 20, 2023",
    schedule: "Monthly",
    shared: false,
  },
];

const dataSources = [
  { value: "sales_orders", label: "Sales Orders", fields: ["order_number", "customer", "date", "amount", "status", "salesperson", "region"] },
  { value: "purchase_orders", label: "Purchase Orders", fields: ["po_number", "vendor", "date", "amount", "status", "buyer"] },
  { value: "customers", label: "Customers", fields: ["name", "email", "phone", "balance", "credit_limit", "region", "industry"] },
  { value: "vendors", label: "Vendors", fields: ["name", "email", "balance", "payment_terms", "category"] },
  { value: "inventory", label: "Inventory Items", fields: ["sku", "name", "quantity", "value", "warehouse", "reorder_point"] },
  { value: "employees", label: "Employees", fields: ["name", "department", "position", "hire_date", "salary", "status"] },
  { value: "transactions", label: "GL Transactions", fields: ["date", "account", "debit", "credit", "memo", "type"] },
];

const operators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "between", label: "Between" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

const aggregations = [
  { value: "sum", label: "Sum" },
  { value: "count", label: "Count" },
  { value: "average", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

export default function CustomReportsPage() {
  const [activeTab, setActiveTab] = useState("saved");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentSource = dataSources.find((s) => s.value === selectedSource);

  const filteredReports = savedReports.filter((report) =>
    report.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Custom Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Build, save, and schedule custom reports.
          </p>
        </div>
        <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Report Name & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input id="reportName" placeholder="Enter report name..." />
                </div>
                <div className="space-y-2">
                  <Label>Data Source</Label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Field Selection */}
              {currentSource && (
                <div className="space-y-2">
                  <Label>Select Fields</Label>
                  <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    {currentSource.fields.map((field) => (
                      <div key={field} className="flex items-center gap-2">
                        <Checkbox
                          id={field}
                          checked={selectedFields.includes(field)}
                          onCheckedChange={() => toggleField(field)}
                        />
                        <label htmlFor={field} className="text-sm capitalize cursor-pointer">
                          {field.replace(/_/g, " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Filters</Label>
                  <Button variant="ghost" size="sm">
                    <span className="material-symbols-outlined text-[16px] mr-1">add</span>
                    Add Filter
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentSource?.fields.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Value" />
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <span className="material-symbols-outlined">delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Grouping & Aggregation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field to group by" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentSource?.fields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Aggregation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aggregation" />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregations.map((agg) => (
                        <SelectItem key={agg.value} value={agg.value}>
                          {agg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort & Limit */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentSource?.fields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Limit</Label>
                  <Input type="number" placeholder="Max rows" />
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label>Schedule (Optional)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">On Demand</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="email" placeholder="Email recipients" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  <span className="material-symbols-outlined text-[16px] mr-1">visibility</span>
                  Preview
                </Button>
                <Button className="bg-primary hover:bg-blue-600">
                  <span className="material-symbols-outlined text-[16px] mr-1">save</span>
                  Save Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4 mt-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="purchasing">Purchasing</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">REPORT NAME</TableHead>
                    <TableHead className="font-bold">TYPE</TableHead>
                    <TableHead className="font-bold">CREATED BY</TableHead>
                    <TableHead className="font-bold">LAST RUN</TableHead>
                    <TableHead className="font-bold">SCHEDULE</TableHead>
                    <TableHead className="font-bold text-center">SHARED</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              analytics
                            </span>
                          </div>
                          <span className="font-medium">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{report.createdBy}</TableCell>
                      <TableCell className="text-muted-foreground">{report.lastRun}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          report.schedule === "Daily"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : report.schedule === "Weekly"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : report.schedule === "Monthly"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }>
                          {report.schedule}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {report.shared ? (
                          <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
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
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedReports.filter(r => r.schedule !== "On Demand").map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.schedule} • Next run: Tomorrow 8:00 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Sales by Region", description: "Breakdown of sales by geographic region", icon: "public", type: "Sales" },
              { name: "AR Aging", description: "Accounts receivable aging report", icon: "account_balance", type: "Finance" },
              { name: "Inventory Valuation", description: "Current inventory value by warehouse", icon: "inventory_2", type: "Inventory" },
              { name: "Open POs", description: "All open purchase orders by status", icon: "shopping_cart", type: "Purchasing" },
              { name: "Headcount Report", description: "Employee count by department", icon: "groups", type: "HR" },
              { name: "Revenue by Product", description: "Revenue breakdown by product line", icon: "trending_up", type: "Sales" },
            ].map((template, index) => (
              <Card key={index} className="hover:border-primary cursor-pointer transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">{template.icon}</span>
                    </div>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
