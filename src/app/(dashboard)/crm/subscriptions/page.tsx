"use client";

import { useState } from "react";
import Link from "next/link";
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

const subscriptions = [
  {
    id: "sub-1",
    subscriptionId: "SUB-2023-0145",
    customer: "Acme Corporation",
    customerId: "CUST-0001",
    planName: "Enterprise",
    planType: "annual",
    monthlyValue: 2500,
    status: "active",
    startDate: "Jan 1, 2023",
    renewalDate: "Jan 1, 2024",
    riskScore: "low",
  },
  {
    id: "sub-2",
    subscriptionId: "SUB-2023-0146",
    customer: "TechStart Inc",
    customerId: "CUST-0002",
    planName: "Professional",
    planType: "monthly",
    monthlyValue: 499,
    status: "active",
    startDate: "Mar 15, 2023",
    renewalDate: "Nov 15, 2023",
    riskScore: "medium",
  },
  {
    id: "sub-3",
    subscriptionId: "SUB-2023-0147",
    customer: "Global Industries",
    customerId: "CUST-0003",
    planName: "Enterprise Plus",
    planType: "annual",
    monthlyValue: 5000,
    status: "active",
    startDate: "Jun 1, 2023",
    renewalDate: "Jun 1, 2024",
    riskScore: "low",
  },
  {
    id: "sub-4",
    subscriptionId: "SUB-2023-0148",
    customer: "Smith & Associates",
    customerId: "CUST-0004",
    planName: "Starter",
    planType: "monthly",
    monthlyValue: 99,
    status: "at_risk",
    startDate: "Sep 1, 2023",
    renewalDate: "Nov 1, 2023",
    riskScore: "high",
  },
  {
    id: "sub-5",
    subscriptionId: "SUB-2023-0149",
    customer: "DataFlow Systems",
    customerId: "CUST-0005",
    planName: "Professional",
    planType: "annual",
    monthlyValue: 450,
    status: "cancelled",
    startDate: "Feb 1, 2023",
    endDate: "Oct 15, 2023",
    cancelReason: "Budget cuts",
    riskScore: "churned",
  },
  {
    id: "sub-6",
    subscriptionId: "SUB-2023-0150",
    customer: "Innovation Labs",
    customerId: "CUST-0006",
    planName: "Enterprise",
    planType: "annual",
    monthlyValue: 2500,
    status: "trial",
    startDate: "Oct 15, 2023",
    trialEndDate: "Nov 15, 2023",
    riskScore: "medium",
  },
];

const churnReasons = [
  { reason: "Budget cuts", count: 12, percentage: 28 },
  { reason: "Switched to competitor", count: 8, percentage: 19 },
  { reason: "No longer needed", count: 7, percentage: 16 },
  { reason: "Poor support experience", count: 6, percentage: 14 },
  { reason: "Missing features", count: 5, percentage: 12 },
  { reason: "Other", count: 5, percentage: 11 },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "at_risk", label: "At Risk" },
  { value: "trial", label: "Trial" },
  { value: "cancelled", label: "Cancelled" },
];

const riskOptions = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
    at_risk: { label: "At Risk", className: "bg-red-100 text-red-800 border-red-200" },
    trial: { label: "Trial", className: "bg-purple-100 text-purple-800 border-purple-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-800 border-slate-200" },
    expired: { label: "Expired", className: "bg-amber-100 text-amber-800 border-amber-200" },
  };
  const { label, className } = config[status] || config.active;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getRiskBadge = (risk: string) => {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "bg-green-100 text-green-800 border-green-200" },
    medium: { label: "Medium", className: "bg-amber-100 text-amber-800 border-amber-200" },
    high: { label: "High", className: "bg-red-100 text-red-800 border-red-200" },
    churned: { label: "Churned", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[risk] || config.low;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch =
      s.subscriptionId.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesRisk = riskFilter === "all" || s.riskScore === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active" || s.status === "trial");
  const mrr = activeSubscriptions.reduce((sum, s) => sum + s.monthlyValue, 0);
  const arr = mrr * 12;
  const atRiskMRR = subscriptions
    .filter((s) => s.status === "at_risk" || s.riskScore === "high")
    .reduce((sum, s) => sum + s.monthlyValue, 0);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "CRM", href: "/crm" },
          { label: "Subscriptions" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Subscription Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor subscriptions and analyze churn risk.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span>
            Export
          </Button>
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Subscription
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[24px]">autorenew</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${(mrr / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">Monthly Recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">calendar_month</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ${(arr / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground">Annual Recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-[24px]">warning</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  ${(atRiskMRR / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">At-Risk MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">groups</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {activeSubscriptions.length}
                </div>
                <p className="text-xs text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriptions Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">All Subscriptions</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full sm:w-48"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskOptions.map((option) => (
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
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold">PLAN</TableHead>
                  <TableHead className="font-bold text-right">MRR</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">RISK</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <div>
                        <Link
                          href={`/sales/customers/${sub.customerId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {sub.customer}
                        </Link>
                        <p className="text-xs text-muted-foreground">{sub.subscriptionId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.planName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{sub.planType}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${sub.monthlyValue.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{getRiskBadge(sub.riskScore)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Churn Analysis */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Churn Reasons</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {churnReasons.map((reason) => (
                <div key={reason.reason}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{reason.reason}</span>
                    <span className="font-medium">{reason.count} ({reason.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${reason.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">At-Risk Indicators</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                  No login in 30+ days
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                  Support tickets unresolved
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                  Usage dropped 50%+
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                  Payment failed
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Upcoming Renewals (Next 30 Days)</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              3 renewals
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">CUSTOMER</TableHead>
                <TableHead className="font-bold">PLAN</TableHead>
                <TableHead className="font-bold">RENEWAL DATE</TableHead>
                <TableHead className="font-bold text-right">VALUE</TableHead>
                <TableHead className="font-bold">RISK</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Link href="#" className="font-medium text-primary hover:underline">
                    TechStart Inc
                  </Link>
                </TableCell>
                <TableCell>Professional (Monthly)</TableCell>
                <TableCell>Nov 15, 2023</TableCell>
                <TableCell className="text-right font-mono">$499/mo</TableCell>
                <TableCell>{getRiskBadge("medium")}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="outline" size="sm">Contact</Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Link href="#" className="font-medium text-primary hover:underline">
                    Smith & Associates
                  </Link>
                </TableCell>
                <TableCell>Starter (Monthly)</TableCell>
                <TableCell>Nov 1, 2023</TableCell>
                <TableCell className="text-right font-mono">$99/mo</TableCell>
                <TableCell>{getRiskBadge("high")}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="outline" size="sm">Contact</Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Link href="#" className="font-medium text-primary hover:underline">
                    Innovation Labs
                  </Link>
                </TableCell>
                <TableCell>Enterprise (Trial)</TableCell>
                <TableCell>Nov 15, 2023</TableCell>
                <TableCell className="text-right font-mono">$2,500/mo</TableCell>
                <TableCell>{getRiskBadge("medium")}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="outline" size="sm">Contact</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
