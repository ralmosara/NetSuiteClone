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

const auditLogs = [
  {
    id: "log-1",
    timestamp: "Oct 24, 2023 10:45:23 AM",
    user: "admin@company.com",
    action: "update",
    entityType: "SalesOrder",
    entityId: "SO-10293",
    description: "Updated status from 'approved' to 'pending_fulfillment'",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log-2",
    timestamp: "Oct 24, 2023 10:32:15 AM",
    user: "sarah.jenkins@company.com",
    action: "create",
    entityType: "Invoice",
    entityId: "INV-2023-089",
    description: "Created invoice for customer Global Corp Inc.",
    ipAddress: "192.168.1.105",
  },
  {
    id: "log-3",
    timestamp: "Oct 24, 2023 10:15:08 AM",
    user: "admin@company.com",
    action: "login",
    entityType: "User",
    entityId: "user-1",
    description: "User logged in successfully",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log-4",
    timestamp: "Oct 24, 2023 09:45:30 AM",
    user: "mike.ross@company.com",
    action: "update",
    entityType: "Item",
    entityId: "NB-PRO-16",
    description: "Updated price from $2,399.00 to $2,499.00",
    ipAddress: "192.168.1.110",
  },
  {
    id: "log-5",
    timestamp: "Oct 24, 2023 09:30:12 AM",
    user: "sarah.jenkins@company.com",
    action: "delete",
    entityType: "Quote",
    entityId: "QT-2023-148",
    description: "Deleted expired quote",
    ipAddress: "192.168.1.105",
  },
  {
    id: "log-6",
    timestamp: "Oct 24, 2023 09:15:45 AM",
    user: "admin@company.com",
    action: "create",
    entityType: "User",
    entityId: "user-12",
    description: "Created new user account for jane.doe@company.com",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log-7",
    timestamp: "Oct 23, 2023 05:30:00 PM",
    user: "system",
    action: "system",
    entityType: "Backup",
    entityId: "backup-2023-10-23",
    description: "Automated daily backup completed",
    ipAddress: "localhost",
  },
];

const actionOptions = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "system", label: "System" },
];

const entityOptions = [
  { value: "all", label: "All Entities" },
  { value: "User", label: "User" },
  { value: "SalesOrder", label: "Sales Order" },
  { value: "Invoice", label: "Invoice" },
  { value: "Item", label: "Item" },
  { value: "Customer", label: "Customer" },
  { value: "Quote", label: "Quote" },
];

const getActionBadge = (action: string) => {
  const config: Record<string, { className: string }> = {
    create: { className: "bg-green-100 text-green-800 border-green-200" },
    update: { className: "bg-blue-100 text-blue-800 border-blue-200" },
    delete: { className: "bg-red-100 text-red-800 border-red-200" },
    login: { className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    logout: { className: "bg-slate-100 text-slate-800 border-slate-200" },
    system: { className: "bg-purple-100 text-purple-800 border-purple-200" },
  };
  const { className } = config[action] || config.system;
  return (
    <Badge variant="outline" className={className}>
      {action.charAt(0).toUpperCase() + action.slice(1)}
    </Badge>
  );
};

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Audit Log" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and changes.
          </p>
        </div>
        <Button variant="outline">
          <span className="material-symbols-outlined text-[18px] mr-2">download</span>
          Export Log
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">Total Events Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {auditLogs.filter((l) => l.action === "create").length}
            </div>
            <p className="text-xs text-muted-foreground">Creates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs.filter((l) => l.action === "update").length}
            </div>
            <p className="text-xs text-muted-foreground">Updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {auditLogs.filter((l) => l.action === "delete").length}
            </div>
            <p className="text-xs text-muted-foreground">Deletes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map((option) => (
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
                <TableHead className="font-bold">TIMESTAMP</TableHead>
                <TableHead className="font-bold">USER</TableHead>
                <TableHead className="font-bold">ACTION</TableHead>
                <TableHead className="font-bold">ENTITY</TableHead>
                <TableHead className="font-bold">DESCRIPTION</TableHead>
                <TableHead className="font-bold">IP ADDRESS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.entityType}</p>
                      <p className="text-xs text-muted-foreground">{log.entityId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {log.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
