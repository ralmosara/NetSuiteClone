"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function JournalEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const { data: entry, isLoading, error } = trpc.finance.getJournalEntry.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateStatus = trpc.finance.updateJournalEntryStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Entry updated", description: `Journal entry has been ${pendingAction}.` });
      utils.finance.getJournalEntry.invalidate({ id: params.id as string });
      setConfirmDialogOpen(false);
      setPendingAction(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setConfirmDialogOpen(false);
      setPendingAction(null);
    },
  });

  const handleStatusChange = (action: string, status: "pending" | "approved" | "posted" | "void") => {
    setPendingAction(action);
    if (status === "void" || status === "posted") {
      setConfirmDialogOpen(true);
    } else {
      updateStatus.mutate({ id: params.id as string, status });
    }
  };

  const confirmStatusChange = () => {
    const statusMap: Record<string, "pending" | "approved" | "posted" | "void"> = {
      posted: "posted",
      voided: "void",
    };
    const status = statusMap[pendingAction || ""];
    if (status) {
      updateStatus.mutate({ id: params.id as string, status });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Journal Entry Not Found</h2>
        <p className="text-muted-foreground mb-4">The journal entry you're looking for doesn't exist.</p>
        <Link href="/finance/transactions">
          <Button>Back to Transactions</Button>
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    posted: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    void: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions", href: "/finance/transactions" },
          { label: entry.entryNumber },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-[32px]">receipt_long</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {entry.entryNumber}
              </h1>
              <Badge variant="outline" className={statusColors[entry.status]}>
                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {new Date(entry.entryDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px] mr-2">more_vert</span>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {entry.status === "pending" && (
                <DropdownMenuItem onClick={() => handleStatusChange("approved", "approved")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">check</span>
                  Approve
                </DropdownMenuItem>
              )}
              {(entry.status === "pending" || entry.status === "approved") && (
                <DropdownMenuItem onClick={() => handleStatusChange("posted", "posted")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">publish</span>
                  Post Entry
                </DropdownMenuItem>
              )}
              {entry.status !== "void" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("voided", "void")}
                    className="text-destructive focus:text-destructive"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-2">block</span>
                    Void Entry
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">print</span>
            Print
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${Number(entry.totalDebit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total Debit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              ${Number(entry.totalCredit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total Credit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{entry.lines.length}</div>
            <p className="text-xs text-muted-foreground">Line Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {Number(entry.totalDebit) === Number(entry.totalCredit) ? "Balanced" : "Unbalanced"}
            </div>
            <p className="text-xs text-muted-foreground">Entry Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Entry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Journal Entry Lines</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">#</TableHead>
                  <TableHead className="font-bold">ACCOUNT</TableHead>
                  <TableHead className="font-bold">MEMO</TableHead>
                  <TableHead className="font-bold text-right">DEBIT</TableHead>
                  <TableHead className="font-bold text-right">CREDIT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line: any) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-muted-foreground">{line.lineNumber}</TableCell>
                    <TableCell>
                      <Link
                        href={`/finance/accounts/${line.accountId}`}
                        className="text-primary hover:underline"
                      >
                        {line.account?.accountNumber} - {line.account?.name}
                      </Link>
                      <p className="text-xs text-muted-foreground capitalize">{line.account?.accountType}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{line.memo || "-"}</TableCell>
                    <TableCell className="text-right">
                      {Number(line.debit) > 0
                        ? `$${Number(line.debit).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(line.credit) > 0
                        ? `$${Number(line.credit).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                  <TableCell colSpan={3} className="text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    ${Number(entry.totalDebit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    ${Number(entry.totalCredit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Entry Number</p>
              <p className="font-medium">{entry.entryNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Entry Date</p>
              <p className="font-medium">{new Date(entry.entryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Status</p>
              <Badge variant="outline" className={statusColors[entry.status]}>
                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
              </Badge>
            </div>
            {entry.postingPeriod && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Posting Period</p>
                <p className="font-medium">{entry.postingPeriod}</p>
              </div>
            )}
            {entry.memo && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Memo</p>
                <p className="text-sm">{entry.memo}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase">Created</p>
              <p className="font-medium">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
            {entry.isAdjusting && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                Adjusting Entry
              </Badge>
            )}
            {entry.isReversing && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                Reversing Entry
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "posted" ? "Post Journal Entry" : "Void Journal Entry"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "posted"
                ? "Are you sure you want to post this journal entry? This will update account balances."
                : "Are you sure you want to void this journal entry? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === "voided" ? "destructive" : "default"}
              onClick={confirmStatusChange}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending
                ? "Processing..."
                : pendingAction === "posted"
                ? "Post Entry"
                : "Void Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
