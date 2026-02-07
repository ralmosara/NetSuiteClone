"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGate } from "@/components/permission-gate";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-blue-100 text-blue-800 border-blue-200" },
    in_progress: { label: "In Progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
    waiting: { label: "Waiting", className: "bg-purple-100 text-purple-800 border-purple-200" },
    resolved: { label: "Resolved", className: "bg-green-100 text-green-800 border-green-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.open;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const config: Record<string, { className: string }> = {
    urgent: { className: "bg-red-100 text-red-800 border-red-200" },
    high: { className: "bg-amber-100 text-amber-800 border-amber-200" },
    medium: { className: "bg-blue-100 text-blue-800 border-blue-200" },
    low: { className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { className } = config[priority] || config.medium;
  return (
    <Badge variant="outline" className={className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

function timeAgo(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function StatsSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function NewCaseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");

  const customersQuery = trpc.customers.searchCustomers.useQuery(
    { query: customerSearch },
    { enabled: customerSearch.length >= 1 }
  );

  const createCase = trpc.crm.createSupportCase.useMutation({
    onSuccess: () => {
      toast({ title: "Support case created successfully" });
      utils.crm.getSupportCases.invalidate();
      utils.crm.getSupportStats.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  function resetForm() {
    setCustomerSearch("");
    setSelectedCustomerId("");
    setSelectedCustomerName("");
    setSubject("");
    setDescription("");
    setPriority("medium");
    setCategory("");
  }

  function handleSubmit() {
    if (!selectedCustomerId || !subject) return;
    createCase.mutate({
      customerId: selectedCustomerId,
      subject,
      description,
      priority: priority as "low" | "medium" | "high" | "urgent",
      category: category || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Support Case</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Customer *</Label>
            {selectedCustomerId ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-slate-50 dark:bg-slate-800">
                <span className="text-sm font-medium">{selectedCustomerName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomerId("");
                    setSelectedCustomerName("");
                    setCustomerSearch("");
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {customerSearch.length >= 1 && customersQuery.data && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg max-h-48 overflow-auto">
                    {customersQuery.data.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No customers found</div>
                    ) : (
                      customersQuery.data.map((c) => (
                        <button
                          key={c.id}
                          className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm border-b last:border-b-0"
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setSelectedCustomerName(c.companyName);
                            setCustomerSearch("");
                          }}
                        >
                          <p className="font-medium">{c.companyName}</p>
                          <p className="text-xs text-muted-foreground">{c.customerId}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              placeholder="Brief description of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Product Question">Product Question</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCustomerId || !subject || createCase.isPending}
          >
            {createCase.isPending ? "Creating..." : "Create Case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const limit = 50;

  // Debounce search
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  function handleSearch(value: string) {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => {
        setSearchDebounced(value);
        setPage(0);
      }, 300)
    );
  }

  const { data, isLoading } = trpc.crm.getSupportCases.useQuery({
    status: statusFilter as any,
    priority: priorityFilter as any,
    search: searchDebounced || undefined,
    limit,
    offset: page * limit,
  });

  const { data: stats, isLoading: statsLoading } = trpc.crm.getSupportStats.useQuery();

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "CRM", href: "/crm" },
          { label: "Support Cases" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Support Cases
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customer support tickets and inquiries.
          </p>
        </div>
        <PermissionGate permission="sales:create">
          <Button className="bg-primary hover:bg-blue-600" onClick={() => setShowNewDialog(true)}>
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Case
          </Button>
        </PermissionGate>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statsLoading ? (
          <StatsSkeleton />
        ) : stats ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.totalCases}</div>
                <p className="text-xs text-muted-foreground">Total Cases</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.openCases}</div>
                <p className="text-xs text-muted-foreground">Open Cases</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
                <p className="text-xs text-muted-foreground">Resolved Today</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Cases</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
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
              <Select
                value={priorityFilter}
                onValueChange={(v) => {
                  setPriorityFilter(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
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
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48 flex-1" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : !data?.cases.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="material-symbols-outlined text-[48px] mb-3 block">
                support_agent
              </span>
              <p className="text-lg font-medium">No support cases found</p>
              <p className="text-sm mt-1">
                {search || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first support case to get started"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">CASE #</TableHead>
                    <TableHead className="font-bold">SUBJECT</TableHead>
                    <TableHead className="font-bold">CUSTOMER</TableHead>
                    <TableHead className="font-bold">ASSIGNED TO</TableHead>
                    <TableHead className="font-bold">PRIORITY</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold">UPDATED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.cases.map((c: any) => (
                    <TableRow key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <Link
                          href={`/crm/support/${c.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {c.caseNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <Link href={`/crm/support/${c.id}`}>
                          <p className="font-medium truncate hover:text-primary">
                            {c.subject}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.customer?.companyName ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.customer?.customerId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {c.assignedTo.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{c.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getPriorityBadge(c.priority)}</TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {timeAgo(c.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * limit + 1}–{Math.min((page + 1) * limit, data.total)} of{" "}
                    {data.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* New Case Dialog */}
      <NewCaseDialog open={showNewDialog} onOpenChange={setShowNewDialog} />
    </div>
  );
}
