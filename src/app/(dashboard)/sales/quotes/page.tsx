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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-800 border-blue-200" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function QuotesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.sales.getQuotes.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  // Calculate stats from the stats data
  const totalQuotes = data?.total || 0;
  const openPipeline = data?.stats?.filter((s: any) => s.status === "draft" || s.status === "sent")
    .reduce((sum: number, s: any) => sum + s._count, 0) || 0;
  const pipelineValue = data?.stats?.filter((s: any) => s.status === "draft" || s.status === "sent")
    .reduce((sum: number, s: any) => sum + Number(s._sum?.total || 0), 0) || 0;
  const wonValue = data?.stats?.filter((s: any) => s.status === "accepted")
    .reduce((sum: number, s: any) => sum + Number(s._sum?.total || 0), 0) || 0;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading quotes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Quotes" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Quotes
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage sales quotes for prospects.
          </p>
        </div>
        <Link href="/sales/quotes/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Quote
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">Total Quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{openPipeline}</div>
            <p className="text-xs text-muted-foreground">Open Pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${pipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pipeline Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${wonValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Won Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Quotes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search quotes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
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
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.quotes && data.quotes.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">QUOTE #</TableHead>
                    <TableHead className="font-bold">CUSTOMER</TableHead>
                    <TableHead className="font-bold">DATE</TableHead>
                    <TableHead className="font-bold">EXPIRES</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-right">AMOUNT</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.quotes.map((quote: any) => (
                    <TableRow key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <Link href={`/sales/quotes/${quote.id}`} className="font-medium text-primary hover:underline">
                          {quote.quoteNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.customer?.companyName}</p>
                          <p className="text-xs text-muted-foreground">{quote.customer?.customerId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(quote.quoteDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="text-right font-bold">
                        ${Number(quote.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/sales/quotes/${quote.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Button>
                          </Link>
                          <Link href={`/sales/quotes/${quote.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {data.pages} ({data.total} quotes)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <span className="material-symbols-outlined text-[48px] mb-2">request_quote</span>
              <p>No quotes found</p>
              <Link href="/sales/quotes/new">
                <Button className="mt-4" variant="outline">
                  Create First Quote
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
