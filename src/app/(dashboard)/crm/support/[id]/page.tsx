"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGate } from "@/components/permission-gate";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

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
  const config: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "bg-slate-100 text-slate-800 border-slate-200" },
    medium: { label: "Medium", className: "bg-blue-100 text-blue-800 border-blue-200" },
    high: { label: "High", className: "bg-amber-100 text-amber-800 border-amber-200" },
    urgent: { label: "Urgent", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[priority] || config.medium;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-96 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function SupportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState("conversation");
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: caseData, isLoading, error } = trpc.crm.getSupportCaseById.useQuery({ id });

  const updateCase = trpc.crm.updateSupportCase.useMutation({
    onSuccess: () => {
      toast({ title: "Case updated successfully" });
      utils.crm.getSupportCaseById.invalidate({ id });
      utils.crm.getSupportCases.invalidate();
      utils.crm.getSupportStats.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const addComment = trpc.crm.addCaseComment.useMutation({
    onSuccess: () => {
      toast({ title: "Comment added" });
      utils.crm.getSupportCaseById.invalidate({ id });
      setNewComment("");
      setIsInternal(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  function handleStatusChange(status: string) {
    updateCase.mutate({
      id,
      status: status as "open" | "in_progress" | "waiting" | "resolved" | "closed",
    });
  }

  function handlePriorityChange(priority: string) {
    updateCase.mutate({
      id,
      priority: priority as "low" | "medium" | "high" | "urgent",
    });
  }

  function handleAddComment() {
    if (!newComment.trim()) return;
    addComment.mutate({
      caseId: id,
      content: newComment,
      isInternal,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "CRM", href: "/crm" },
            { label: "Support", href: "/crm/support" },
            { label: "Loading..." },
          ]}
        />
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "CRM", href: "/crm" },
            { label: "Support", href: "/crm/support" },
            { label: "Not Found" },
          ]}
        />
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-3 block">
            error
          </span>
          <h2 className="text-xl font-bold">Support case not found</h2>
          <p className="text-muted-foreground mt-1">
            The case you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Button className="mt-4" onClick={() => router.push("/crm/support")}>
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  const sortedComments = [...(caseData.comments || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const isResolvable = !["resolved", "closed"].includes(caseData.status);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "CRM", href: "/crm" },
          { label: "Support", href: "/crm/support" },
          { label: caseData.caseNumber },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {caseData.caseNumber}
            </h1>
            {getStatusBadge(caseData.status)}
            {getPriorityBadge(caseData.priority)}
          </div>
          <p className="text-lg mt-2">{caseData.subject}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Opened {formatDate(caseData.createdAt)} &bull; Last updated{" "}
            {timeAgo(caseData.updatedAt)}
          </p>
        </div>
        <PermissionGate permission="sales:edit">
          <div className="flex gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={updateCase.isPending}>
                  <span className="material-symbols-outlined text-[18px] mr-2">
                    swap_horiz
                  </span>
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["open", "in_progress", "waiting", "resolved", "closed"].map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={s === caseData.status}
                  >
                    {s
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                    {s === caseData.status && " (current)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isResolvable && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("resolved")}
                disabled={updateCase.isPending}
              >
                <span className="material-symbols-outlined text-[18px] mr-2">
                  check_circle
                </span>
                Resolve
              </Button>
            )}
          </div>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="conversation"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Conversation ({sortedComments.length})
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="mt-6 space-y-4">
              {/* Reply Box */}
              <PermissionGate permission="sales:edit">
                <Card>
                  <CardContent className="pt-6">
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-900"
                      placeholder="Type your reply..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        Internal note (not visible to customer)
                      </label>
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addComment.isPending}
                      >
                        <span className="material-symbols-outlined text-[16px] mr-1">
                          send
                        </span>
                        {addComment.isPending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </PermissionGate>

              {/* Comments */}
              {sortedComments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="material-symbols-outlined text-[36px] mb-2 block">
                    forum
                  </span>
                  <p className="text-sm">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedComments.map((comment) => (
                    <Card
                      key={comment.id}
                      className={
                        comment.isInternal
                          ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                          : ""
                      }
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-white text-sm">
                              {comment.authorName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{comment.authorName}</span>
                              {comment.isInternal && (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-100 text-amber-800 border-amber-200 text-xs"
                                >
                                  Internal
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            {comment.authorEmail && (
                              <p className="text-sm text-muted-foreground">
                                {comment.authorEmail}
                              </p>
                            )}
                            <div className="mt-3 whitespace-pre-wrap text-sm">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {caseData.description ? (
                    <p className="whitespace-pre-wrap">{caseData.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided</p>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 text-[16px]">
                        add_circle
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Case created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(caseData.createdAt)}
                      </p>
                    </div>
                  </div>
                  {caseData.resolvedAt && (
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 text-[16px]">
                          check_circle
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Resolved</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(caseData.resolvedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {caseData.closedAt && (
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600 text-[16px]">
                          lock
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Closed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(caseData.closedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(caseData as any).customer ? (
                <>
                  <Link
                    href={`/sales/customers/${(caseData as any).customer.id}`}
                    className="font-medium text-primary hover:underline text-lg block"
                  >
                    {(caseData as any).customer.companyName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {(caseData as any).customer.customerId}
                  </p>
                  {(caseData as any).customer.email && (
                    <p className="text-sm">{(caseData as any).customer.email}</p>
                  )}
                  {(caseData as any).customer.phone && (
                    <p className="text-sm">{(caseData as any).customer.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No customer linked</p>
              )}
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
                  <PermissionGate
                    permission="sales:edit"
                    fallback={getStatusBadge(caseData.status)}
                  >
                    <Select
                      value={caseData.status}
                      onValueChange={handleStatusChange}
                      disabled={updateCase.isPending}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["open", "in_progress", "waiting", "resolved", "closed"].map(
                          (s) => (
                            <SelectItem key={s} value={s}>
                              {s
                                .split("_")
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ")}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </PermissionGate>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Priority</p>
                  <PermissionGate
                    permission="sales:edit"
                    fallback={getPriorityBadge(caseData.priority)}
                  >
                    <Select
                      value={caseData.priority}
                      onValueChange={handlePriorityChange}
                      disabled={updateCase.isPending}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["low", "medium", "high", "urgent"].map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PermissionGate>
                </div>
              </div>
              {caseData.category && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Category</p>
                  <p className="font-medium">{caseData.category}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Assigned To</p>
                {(caseData as any).assignedTo ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(caseData as any).assignedTo.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {(caseData as any).assignedTo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(caseData as any).assignedTo.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">Unassigned</p>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Created</p>
                  <p>{formatDate(caseData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Updated</p>
                  <p>{formatDate(caseData.updatedAt)}</p>
                </div>
                {caseData.resolvedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Resolved</p>
                    <p>{formatDate(caseData.resolvedAt)}</p>
                  </div>
                )}
                {caseData.closedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Closed</p>
                    <p>{formatDate(caseData.closedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
