"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const products = [
  {
    id: "prod-1",
    sku: "ELEC-001",
    name: "Smart Home Hub Pro",
    category: "Electronics",
    stage: "production",
    version: "2.1",
    launchDate: "Jan 15, 2023",
    endOfLife: null,
    owner: "Mike Chen",
    revisions: 8,
  },
  {
    id: "prod-2",
    sku: "ELEC-002",
    name: "Wireless Sensor Kit",
    category: "Electronics",
    stage: "growth",
    version: "1.3",
    launchDate: "Mar 1, 2023",
    endOfLife: null,
    owner: "Sarah Lee",
    revisions: 5,
  },
  {
    id: "prod-3",
    sku: "ELEC-003",
    name: "Smart Thermostat",
    category: "Electronics",
    stage: "development",
    version: "0.9",
    launchDate: null,
    endOfLife: null,
    owner: "John Smith",
    revisions: 12,
  },
  {
    id: "prod-4",
    sku: "ELEC-004",
    name: "Legacy Controller v1",
    category: "Electronics",
    stage: "decline",
    version: "1.0",
    launchDate: "Jun 10, 2020",
    endOfLife: "Dec 31, 2023",
    owner: "Mike Chen",
    revisions: 3,
  },
  {
    id: "prod-5",
    sku: "ACC-001",
    name: "Universal Mounting Bracket",
    category: "Accessories",
    stage: "maturity",
    version: "3.0",
    launchDate: "Sep 15, 2021",
    endOfLife: null,
    owner: "Jane Doe",
    revisions: 6,
  },
  {
    id: "prod-6",
    sku: "ELEC-005",
    name: "Motion Detector Pro",
    category: "Electronics",
    stage: "introduction",
    version: "1.0",
    launchDate: "Oct 1, 2023",
    endOfLife: null,
    owner: "Sarah Lee",
    revisions: 2,
  },
];

const engineeringChanges = [
  {
    id: "ecn-1",
    number: "ECN-2023-045",
    product: "Smart Home Hub Pro",
    type: "Design Change",
    priority: "high",
    status: "pending_approval",
    requestedBy: "Mike Chen",
    requestDate: "Oct 25, 2023",
    description: "Update PCB layout for improved thermal management",
  },
  {
    id: "ecn-2",
    number: "ECN-2023-044",
    product: "Wireless Sensor Kit",
    type: "Component Change",
    priority: "medium",
    status: "approved",
    requestedBy: "Sarah Lee",
    requestDate: "Oct 20, 2023",
    description: "Replace capacitor C12 with higher rated component",
  },
  {
    id: "ecn-3",
    number: "ECN-2023-043",
    product: "Smart Thermostat",
    type: "New Feature",
    priority: "medium",
    status: "in_progress",
    requestedBy: "John Smith",
    requestDate: "Oct 15, 2023",
    description: "Add humidity sensor integration",
  },
  {
    id: "ecn-4",
    number: "ECN-2023-042",
    product: "Motion Detector Pro",
    type: "Bug Fix",
    priority: "critical",
    status: "completed",
    requestedBy: "Sarah Lee",
    requestDate: "Oct 10, 2023",
    description: "Fix false trigger issue in low light conditions",
  },
];

const stageConfig: Record<string, { label: string; className: string; icon: string }> = {
  development: { label: "Development", className: "bg-purple-100 text-purple-800 border-purple-200", icon: "engineering" },
  introduction: { label: "Introduction", className: "bg-blue-100 text-blue-800 border-blue-200", icon: "rocket_launch" },
  growth: { label: "Growth", className: "bg-green-100 text-green-800 border-green-200", icon: "trending_up" },
  maturity: { label: "Maturity", className: "bg-amber-100 text-amber-800 border-amber-200", icon: "verified" },
  production: { label: "Production", className: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: "precision_manufacturing" },
  decline: { label: "Decline", className: "bg-red-100 text-red-800 border-red-200", icon: "trending_down" },
};

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending_approval: { label: "Pending Approval", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-800 border-slate-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.pending_approval;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const config: Record<string, { className: string }> = {
    critical: { className: "bg-red-600 text-white" },
    high: { className: "bg-orange-100 text-orange-800" },
    medium: { className: "bg-blue-100 text-blue-800" },
    low: { className: "bg-slate-100 text-slate-800" },
  };
  const { className } = config[priority] || config.medium;
  return <Badge className={className}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
};

export default function PLMPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || product.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stageCounts = {
    development: products.filter((p) => p.stage === "development").length,
    introduction: products.filter((p) => p.stage === "introduction").length,
    growth: products.filter((p) => p.stage === "growth").length,
    maturity: products.filter((p) => p.stage === "maturity").length,
    production: products.filter((p) => p.stage === "production").length,
    decline: products.filter((p) => p.stage === "decline").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Product Lifecycle Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage products from concept to end-of-life.
          </p>
        </div>
        <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="ELEC-XXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="Enter product name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Product description..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Product Owner</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                      <SelectItem value="sarah">Sarah Lee</SelectItem>
                      <SelectItem value="john">John Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Initial Version</Label>
                  <Input id="version" placeholder="0.1" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-blue-600">
                  Create Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lifecycle Stage Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stageConfig).map(([key, config]) => (
          <Card
            key={key}
            className={`cursor-pointer hover:border-primary transition-colors ${
              stageFilter === key ? "border-primary ring-1 ring-primary" : ""
            }`}
            onClick={() => setStageFilter(stageFilter === key ? "all" : key)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined ${
                  key === "development" ? "text-purple-600" :
                  key === "introduction" ? "text-blue-600" :
                  key === "growth" ? "text-green-600" :
                  key === "maturity" ? "text-amber-600" :
                  key === "production" ? "text-cyan-600" :
                  "text-red-600"
                }`}>
                  {config.icon}
                </span>
                <span className="text-2xl font-bold">
                  {stageCounts[key as keyof typeof stageCounts]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="changes">Engineering Changes</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {Object.entries(stageConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">PRODUCT</TableHead>
                    <TableHead className="font-bold">SKU</TableHead>
                    <TableHead className="font-bold">STAGE</TableHead>
                    <TableHead className="font-bold">VERSION</TableHead>
                    <TableHead className="font-bold">OWNER</TableHead>
                    <TableHead className="font-bold">LAUNCH DATE</TableHead>
                    <TableHead className="font-bold text-center">REVISIONS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stage = stageConfig[product.stage];
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell>
                          <Link
                            href={`/manufacturing/plm/${product.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stage.className}>
                            <span className="material-symbols-outlined text-[14px] mr-1">
                              {stage.icon}
                            </span>
                            {stage.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">v{product.version}</TableCell>
                        <TableCell className="text-muted-foreground">{product.owner}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.launchDate || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{product.revisions}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">history</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Engineering Change Notices</CardTitle>
                <Button size="sm" className="bg-primary hover:bg-blue-600">
                  <span className="material-symbols-outlined text-[16px] mr-1">add</span>
                  New ECN
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">ECN NUMBER</TableHead>
                    <TableHead className="font-bold">PRODUCT</TableHead>
                    <TableHead className="font-bold">TYPE</TableHead>
                    <TableHead className="font-bold">PRIORITY</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold">REQUESTED BY</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineeringChanges.map((ecn) => (
                    <TableRow key={ecn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="font-medium font-mono">{ecn.number}</TableCell>
                      <TableCell>{ecn.product}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ecn.type}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ecn.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ecn.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{ecn.requestedBy}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                          {ecn.status === "pending_approval" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6 mt-6">
          {/* Timeline Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Roadmap - Q4 2023</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Q4 Milestones */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                  {[
                    { date: "Oct 2023", title: "Motion Detector Pro Launch", product: "ELEC-005", status: "completed" },
                    { date: "Nov 2023", title: "Smart Hub Pro v2.2 Release", product: "ELEC-001", status: "in_progress" },
                    { date: "Nov 2023", title: "Sensor Kit Firmware Update", product: "ELEC-002", status: "planned" },
                    { date: "Dec 2023", title: "Smart Thermostat Beta", product: "ELEC-003", status: "planned" },
                    { date: "Dec 2023", title: "Legacy Controller EOL", product: "ELEC-004", status: "planned" },
                  ].map((milestone, index) => (
                    <div key={index} className="relative pl-10 pb-6">
                      <div className={`absolute left-2 size-5 rounded-full border-2 ${
                        milestone.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : milestone.status === "in_progress"
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white dark:bg-slate-900 border-slate-300"
                      }`}>
                        {milestone.status === "completed" && (
                          <span className="material-symbols-outlined text-white text-[12px] flex items-center justify-center h-full">
                            check
                          </span>
                        )}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{milestone.date}</p>
                            <p className="font-medium mt-1">{milestone.title}</p>
                            <Badge variant="secondary" className="mt-2">{milestone.product}</Badge>
                          </div>
                          <Badge variant="outline" className={
                            milestone.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : milestone.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }>
                            {milestone.status === "completed" ? "Completed" :
                             milestone.status === "in_progress" ? "In Progress" : "Planned"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Development Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Development Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {products.filter(p => p.stage === "development").map((product) => (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Version {product.version}</p>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Design Complete
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Prototype Approved
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-500">pending</span>
                        Testing
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">radio_button_unchecked</span>
                        Production Ready
                      </span>
                    </div>
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