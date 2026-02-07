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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const revenueRules = [
  {
    id: "rule-1",
    name: "SaaS Subscription - Monthly",
    type: "Subscription",
    method: "Straight-Line",
    period: "Monthly",
    deferral: "Yes",
    status: "active",
    contracts: 145,
  },
  {
    id: "rule-2",
    name: "Annual License",
    type: "License",
    method: "Straight-Line",
    period: "12 Months",
    deferral: "Yes",
    status: "active",
    contracts: 52,
  },
  {
    id: "rule-3",
    name: "Professional Services",
    type: "Service",
    method: "Percentage of Completion",
    period: "Project-Based",
    deferral: "Yes",
    status: "active",
    contracts: 28,
  },
  {
    id: "rule-4",
    name: "Hardware Sales",
    type: "Product",
    method: "Point in Time",
    period: "Upon Delivery",
    deferral: "No",
    status: "active",
    contracts: 312,
  },
  {
    id: "rule-5",
    name: "Maintenance Contracts",
    type: "Service",
    method: "Straight-Line",
    period: "12 Months",
    deferral: "Yes",
    status: "active",
    contracts: 89,
  },
];

const deferredRevenue = [
  {
    id: "def-1",
    contractId: "CNT-2023-001",
    customer: "Acme Corp",
    rule: "SaaS Subscription - Monthly",
    totalAmount: 120000,
    recognized: 80000,
    deferred: 40000,
    startDate: "Jan 1, 2023",
    endDate: "Dec 31, 2023",
    progress: 67,
  },
  {
    id: "def-2",
    contractId: "CNT-2023-015",
    customer: "TechStart Inc",
    rule: "Annual License",
    totalAmount: 48000,
    recognized: 32000,
    deferred: 16000,
    startDate: "Mar 1, 2023",
    endDate: "Feb 28, 2024",
    progress: 67,
  },
  {
    id: "def-3",
    contractId: "CNT-2023-022",
    customer: "Global Systems",
    rule: "Professional Services",
    totalAmount: 85000,
    recognized: 51000,
    deferred: 34000,
    startDate: "Apr 15, 2023",
    endDate: "Dec 15, 2023",
    progress: 60,
  },
  {
    id: "def-4",
    contractId: "CNT-2023-045",
    customer: "Enterprise Solutions",
    rule: "Maintenance Contracts",
    totalAmount: 36000,
    recognized: 21000,
    deferred: 15000,
    startDate: "May 1, 2023",
    endDate: "Apr 30, 2024",
    progress: 58,
  },
  {
    id: "def-5",
    contractId: "CNT-2023-067",
    customer: "Digital First LLC",
    rule: "SaaS Subscription - Monthly",
    totalAmount: 24000,
    recognized: 12000,
    deferred: 12000,
    startDate: "Jul 1, 2023",
    endDate: "Jun 30, 2024",
    progress: 50,
  },
];

const scheduleEntries = [
  { period: "Oct 2023", recognized: 125000, deferred: 875000, cumulative: 625000 },
  { period: "Nov 2023", recognized: 125000, deferred: 750000, cumulative: 750000 },
  { period: "Dec 2023", recognized: 125000, deferred: 625000, cumulative: 875000 },
  { period: "Jan 2024", recognized: 125000, deferred: 500000, cumulative: 1000000 },
  { period: "Feb 2024", recognized: 125000, deferred: 375000, cumulative: 1125000 },
  { period: "Mar 2024", recognized: 125000, deferred: 250000, cumulative: 1250000 },
];

export default function RevenueRecognitionPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);

  const totalDeferred = deferredRevenue.reduce((sum, d) => sum + d.deferred, 0);
  const totalRecognized = deferredRevenue.reduce((sum, d) => sum + d.recognized, 0);
  const totalContracts = deferredRevenue.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Revenue Recognition
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage revenue recognition rules and deferred revenue (ASC 606).
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">play_arrow</span>
            Run Recognition
          </Button>
          <Dialog open={isNewRuleOpen} onOpenChange={setIsNewRuleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-600">
                <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Revenue Recognition Rule</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input id="ruleName" placeholder="Enter rule name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Revenue Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="license">License</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recognition Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight-line">Straight-Line</SelectItem>
                        <SelectItem value="percentage">Percentage of Completion</SelectItem>
                        <SelectItem value="point-in-time">Point in Time</SelectItem>
                        <SelectItem value="milestone">Milestone-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recognition Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deferral Account</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2400">2400 - Deferred Revenue</SelectItem>
                        <SelectItem value="2410">2410 - Unearned Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewRuleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-blue-600">
                    Create Rule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">description</span>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  ${(totalContracts / 1000000).toFixed(2)}M
                </div>
                <p className="text-xs text-muted-foreground">Total Contract Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">trending_up</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${(totalRecognized / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground">Recognized YTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600">schedule</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  ${(totalDeferred / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground">Deferred Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">rule</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{revenueRules.length}</div>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="deferred">Deferred Revenue</TabsTrigger>
          <TabsTrigger value="schedule">Recognition Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Recognition Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recognition Progress - Current Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {deferredRevenue.slice(0, 3).map((contract) => (
                  <div key={contract.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{contract.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.contractId} • {contract.rule}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${contract.recognized.toLocaleString()} / ${contract.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{contract.progress}% recognized</p>
                      </div>
                    </div>
                    <Progress value={contract.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Start: {contract.startDate}</span>
                      <span>End: {contract.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Recognition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next 3 Months</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduleEntries.slice(0, 3).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-green-600 text-[20px]">
                            calendar_month
                          </span>
                        </div>
                        <span className="font-medium">{entry.period}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          +${(entry.recognized / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground">to recognize</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Subscription", amount: 144000, percent: 45, color: "bg-blue-500" },
                    { type: "License", amount: 80000, percent: 25, color: "bg-green-500" },
                    { type: "Services", amount: 64000, percent: 20, color: "bg-purple-500" },
                    { type: "Maintenance", amount: 32000, percent: 10, color: "bg-amber-500" },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.type}</span>
                        <span className="font-medium">${(item.amount / 1000).toFixed(0)}K ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">RULE NAME</TableHead>
                    <TableHead className="font-bold">TYPE</TableHead>
                    <TableHead className="font-bold">METHOD</TableHead>
                    <TableHead className="font-bold">PERIOD</TableHead>
                    <TableHead className="font-bold text-center">DEFERRAL</TableHead>
                    <TableHead className="font-bold text-center">CONTRACTS</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueRules.map((rule) => (
                    <TableRow key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rule.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rule.method}</TableCell>
                      <TableCell className="text-muted-foreground">{rule.period}</TableCell>
                      <TableCell className="text-center">
                        {rule.deferral === "Yes" ? (
                          <span className="material-symbols-outlined text-green-600">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">remove_circle</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono">{rule.contracts}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
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

        <TabsContent value="deferred" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Deferred Revenue Contracts</CardTitle>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Rules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rules</SelectItem>
                      {revenueRules.map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>{rule.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">CONTRACT</TableHead>
                    <TableHead className="font-bold">CUSTOMER</TableHead>
                    <TableHead className="font-bold">RULE</TableHead>
                    <TableHead className="font-bold text-right">TOTAL</TableHead>
                    <TableHead className="font-bold text-right">RECOGNIZED</TableHead>
                    <TableHead className="font-bold text-right">DEFERRED</TableHead>
                    <TableHead className="font-bold">PROGRESS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deferredRevenue.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="font-medium font-mono">{contract.contractId}</TableCell>
                      <TableCell>{contract.customer}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{contract.rule}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${contract.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        ${contract.recognized.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-600">
                        ${contract.deferred.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={contract.progress} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{contract.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
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

        <TabsContent value="schedule" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recognition Schedule</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="2023">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">PERIOD</TableHead>
                    <TableHead className="font-bold text-right">TO RECOGNIZE</TableHead>
                    <TableHead className="font-bold text-right">REMAINING DEFERRED</TableHead>
                    <TableHead className="font-bold text-right">CUMULATIVE RECOGNIZED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleEntries.map((entry, index) => (
                    <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="font-medium">{entry.period}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        +${entry.recognized.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-600">
                        ${entry.deferred.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ${entry.cumulative.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ASC 606 Compliance Note */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-400">
                    ASC 606 Compliance
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Revenue recognition follows ASC 606 (Revenue from Contracts with Customers) guidelines.
                    The five-step model is applied: identify contract, identify performance obligations,
                    determine transaction price, allocate price, and recognize revenue when obligations are satisfied.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
