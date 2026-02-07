"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useSession } from "next-auth/react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending_fulfillment":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "fulfilled":
    case "closed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending_approval":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

function getActivityIcon(action: string, entityType: string) {
  if (action === "create") {
    if (entityType === "Employee" || entityType === "User") return "person_add";
    if (entityType === "SalesOrder") return "receipt_long";
    if (entityType === "PurchaseOrder") return "shopping_cart";
    return "add_circle";
  }
  if (action === "update") return "edit";
  if (action === "delete") return "delete";
  return "info";
}

// --- Skeleton Loaders ---

function KpiSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// --- KPI Cards ---

function SalesKpis() {
  const { data, isLoading } = trpc.sales.getDashboardStats.useQuery();

  if (isLoading) {
    return (
      <>
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </>
    );
  }

  if (!data) return null;

  const orderGrowthPositive = data.orderGrowth >= 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenue This Month
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            payments
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(Number(data.monthRevenue))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(Number(data.totalRevenue))} total lifetime
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Orders This Month
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            receipt_long
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(data.monthOrders)}
          </div>
          <p
            className={`text-xs flex items-center mt-1 ${
              orderGrowthPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] mr-1">
              {orderGrowthPositive ? "trending_up" : "trending_down"}
            </span>
            {orderGrowthPositive ? "+" : ""}
            {data.orderGrowth.toFixed(1)}% vs last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Open Invoices
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            description
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(data.openInvoices)}
          </div>
          {data.overdueInvoices > 0 ? (
            <p className="text-xs text-red-600 flex items-center mt-1">
              <span className="material-symbols-outlined text-[16px] mr-1">
                warning
              </span>
              {data.overdueInvoices} overdue
            </p>
          ) : (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <span className="material-symbols-outlined text-[16px] mr-1">
                check_circle
              </span>
              None overdue
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Fulfillment
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            local_shipping
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(data.pendingOrders)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatNumber(data.totalOrders)} total orders
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function FallbackKpis() {
  const { hasModuleAccess } = usePermissions();

  const showPurchasing = hasModuleAccess("purchasing");
  const showInventory = hasModuleAccess("inventory");
  const showFinance = hasModuleAccess("finance");
  const showPayroll = hasModuleAccess("payroll");

  const purchasingStats = trpc.purchasing.getDashboardStats.useQuery(
    undefined,
    { enabled: showPurchasing }
  );
  const inventoryStats = trpc.inventory.getDashboardStats.useQuery(undefined, {
    enabled: showInventory,
  });
  const financeStats = trpc.finance.getDashboardStats.useQuery(undefined, {
    enabled: showFinance,
  });
  const employeeStats = trpc.employees.getDashboardStats.useQuery(undefined, {
    enabled: showPayroll,
  });

  const isLoading =
    (showPurchasing && purchasingStats.isLoading) ||
    (showInventory && inventoryStats.isLoading) ||
    (showFinance && financeStats.isLoading) ||
    (showPayroll && employeeStats.isLoading);

  if (isLoading) {
    return (
      <>
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </>
    );
  }

  const cards: React.ReactNode[] = [];

  if (showPurchasing && purchasingStats.data) {
    const d = purchasingStats.data;
    cards.push(
      <Card key="po-spend">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            PO Spend This Month
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            shopping_cart
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(Number(d.monthSpend))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {d.pendingPOs} pending POs
          </p>
        </CardContent>
      </Card>
    );
    cards.push(
      <Card key="open-bills">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Open Bills
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            request_quote
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(d.openBills)}</div>
          {d.overdueBills > 0 ? (
            <p className="text-xs text-red-600 flex items-center mt-1">
              <span className="material-symbols-outlined text-[16px] mr-1">
                warning
              </span>
              {d.overdueBills} overdue
            </p>
          ) : (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <span className="material-symbols-outlined text-[16px] mr-1">
                check_circle
              </span>
              None overdue
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showInventory && inventoryStats.data) {
    const d = inventoryStats.data;
    cards.push(
      <Card key="inv-value">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Inventory Value
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            inventory_2
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(d.totalValue)}
          </div>
          {d.lowStockItems > 0 ? (
            <p className="text-xs text-amber-600 flex items-center mt-1">
              <span className="material-symbols-outlined text-[16px] mr-1">
                warning
              </span>
              {d.lowStockItems} items low stock
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              {d.activeItems} active items
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showFinance && financeStats.data) {
    const d = financeStats.data;
    cards.push(
      <Card key="net-income">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Income
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            account_balance
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(d.netIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {d.pendingEntries} pending journal entries
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showPayroll && employeeStats.data) {
    const d = employeeStats.data;
    cards.push(
      <Card key="employees">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Employees
          </CardTitle>
          <span className="material-symbols-outlined text-primary text-[20px]">
            people
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(d.activeEmployees)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {d.pendingTimeOff} pending time-off requests
          </p>
        </CardContent>
      </Card>
    );
  }

  if (cards.length === 0) return null;

  return <>{cards.slice(0, 4)}</>;
}

// --- Quick Actions ---

function QuickActions() {
  const { hasPermission } = usePermissions();

  const actions = [
    {
      icon: "add_shopping_cart",
      label: "New Sales Order",
      href: "/sales/orders/new",
      permission: "sales:create",
    },
    {
      icon: "local_shipping",
      label: "New Purchase Order",
      href: "/purchasing/orders/new",
      permission: "purchasing:create",
    },
    {
      icon: "person_add",
      label: "New Customer",
      href: "/sales/customers/new",
      permission: "sales:create",
    },
    {
      icon: "receipt",
      label: "Create Invoice",
      href: "/sales/invoices/new",
      permission: "sales:create",
    },
    {
      icon: "inventory_2",
      label: "New Item",
      href: "/inventory/items/new",
      permission: "inventory:create",
    },
    {
      icon: "account_balance",
      label: "Journal Entry",
      href: "/finance/journal-entries/new",
      permission: "finance:create",
    },
  ];

  const visibleActions = actions.filter((a) => hasPermission(a.permission));

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {visibleActions.slice(0, 6).map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary"
            >
              <span className="material-symbols-outlined text-primary text-[24px]">
                {action.icon}
              </span>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Recent Sales Orders ---

function RecentSalesOrders() {
  const { data, isLoading } = trpc.sales.getSalesOrders.useQuery({
    page: 1,
    limit: 5,
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Sales Orders</CardTitle>
        <Link
          href="/sales/orders"
          className="text-sm text-primary hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : !data?.orders.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="material-symbols-outlined text-[36px] mb-2 block">
              receipt_long
            </span>
            <p className="text-sm">No sales orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                    Order #
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                    Customer
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-2">
                      <Link
                        href={`/sales/orders/${order.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-sm">
                      {(order as any).customer?.companyName ?? "—"}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Alerts ---

function AlertsCard() {
  const { hasModuleAccess } = usePermissions();

  const showSales = hasModuleAccess("sales");
  const showPurchasing = hasModuleAccess("purchasing");
  const showInventory = hasModuleAccess("inventory");
  const showPayroll = hasModuleAccess("payroll");

  const salesStats = trpc.sales.getDashboardStats.useQuery(undefined, {
    enabled: showSales,
  });
  const purchasingStats = trpc.purchasing.getDashboardStats.useQuery(
    undefined,
    { enabled: showPurchasing }
  );
  const inventoryStats = trpc.inventory.getDashboardStats.useQuery(undefined, {
    enabled: showInventory,
  });
  const employeeStats = trpc.employees.getDashboardStats.useQuery(undefined, {
    enabled: showPayroll,
  });

  const alerts: {
    icon: string;
    title: string;
    description: string;
    severity: "red" | "amber" | "blue";
    href: string;
  }[] = [];

  if (showInventory && inventoryStats.data?.lowStockItems) {
    alerts.push({
      icon: "inventory",
      title: "Low Stock Alert",
      description: `${inventoryStats.data.lowStockItems} items are below reorder point`,
      severity: "amber",
      href: "/inventory/items",
    });
  }

  if (showSales && salesStats.data?.overdueInvoices) {
    alerts.push({
      icon: "schedule",
      title: "Overdue Invoices",
      description: `${salesStats.data.overdueInvoices} invoices are past due date`,
      severity: "red",
      href: "/sales/invoices",
    });
  }

  if (showPurchasing && purchasingStats.data?.overdueBills) {
    alerts.push({
      icon: "receipt_long",
      title: "Overdue Bills",
      description: `${purchasingStats.data.overdueBills} vendor bills are past due`,
      severity: "red",
      href: "/purchasing",
    });
  }

  if (showPurchasing && purchasingStats.data?.pendingPOs) {
    alerts.push({
      icon: "approval",
      title: "Pending Purchase Orders",
      description: `${purchasingStats.data.pendingPOs} purchase orders await processing`,
      severity: "blue",
      href: "/purchasing/orders",
    });
  }

  if (showSales && salesStats.data?.pendingOrders) {
    alerts.push({
      icon: "local_shipping",
      title: "Pending Fulfillment",
      description: `${salesStats.data.pendingOrders} sales orders need fulfillment`,
      severity: "blue",
      href: "/sales/orders",
    });
  }

  if (showPayroll && employeeStats.data?.pendingTimeOff) {
    alerts.push({
      icon: "event_busy",
      title: "Pending Time Off",
      description: `${employeeStats.data.pendingTimeOff} time-off requests need review`,
      severity: "blue",
      href: "/payroll/time-off",
    });
  }

  const severityColors = {
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  const iconColors = {
    red: "text-red-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-[20px]">
            warning
          </span>
          Alerts & Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <span className="material-symbols-outlined text-[32px] text-green-500 mb-2 block">
              check_circle
            </span>
            <p className="text-sm">No alerts — everything looks good!</p>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert, i) => (
            <Link key={i} href={alert.href} className="block">
              <div
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:opacity-80 ${severityColors[alert.severity]}`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${iconColors[alert.severity]}`}
                >
                  {alert.icon}
                </span>
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// --- Recent Activity ---

function RecentActivity() {
  const { data, isLoading } = trpc.setup.getAuditLogs.useQuery({
    page: 1,
    limit: 6,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Link
          href="/setup/audit-log"
          className="text-sm text-primary hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.logs.length ? (
          <div className="text-center py-6 text-muted-foreground">
            <span className="material-symbols-outlined text-[32px] mb-2 block">
              history
            </span>
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-[16px]">
                    {getActivityIcon(log.action, log.entityType)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="capitalize">{log.action}</span>{" "}
                    {log.entityType}
                    {log.entityId ? (
                      <span className="text-muted-foreground">
                        {" "}
                        #{log.entityId.slice(0, 8)}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(log as any).user?.name ||
                      (log as any).user?.email ||
                      "System"}{" "}
                    &bull; {timeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Module Overview Cards ---

function ModuleOverviewCards() {
  const { hasModuleAccess } = usePermissions();

  const showPurchasing = hasModuleAccess("purchasing");
  const showInventory = hasModuleAccess("inventory");
  const showFinance = hasModuleAccess("finance");
  const showPayroll = hasModuleAccess("payroll");

  const purchasingStats = trpc.purchasing.getDashboardStats.useQuery(
    undefined,
    { enabled: showPurchasing }
  );
  const inventoryStats = trpc.inventory.getDashboardStats.useQuery(undefined, {
    enabled: showInventory,
  });
  const financeStats = trpc.finance.getDashboardStats.useQuery(undefined, {
    enabled: showFinance,
  });
  const employeeStats = trpc.employees.getDashboardStats.useQuery(undefined, {
    enabled: showPayroll,
  });
  const manufacturingStats = trpc.manufacturing.getManufacturingStats.useQuery(
    undefined,
    { enabled: showInventory }
  );

  const hasAny = showPurchasing || showInventory || showFinance || showPayroll;
  if (!hasAny) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {showPurchasing && (
        <Link href="/purchasing" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-[20px]">
                    shopping_cart
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Purchasing</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
              {purchasingStats.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : purchasingStats.data ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">POs this month</span>
                    <span className="font-medium">
                      {purchasingStats.data.monthPOs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open bills</span>
                    <span className="font-medium">
                      {purchasingStats.data.openBills}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Month spend</span>
                    <span className="font-medium">
                      {formatCurrency(Number(purchasingStats.data.monthSpend))}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      )}

      {showInventory && (
        <Link href="/inventory" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-600 text-[20px]">
                    inventory_2
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Inventory</p>
                  <p className="text-xs text-muted-foreground">Overview</p>
                </div>
              </div>
              {inventoryStats.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : inventoryStats.data ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active items</span>
                    <span className="font-medium">
                      {inventoryStats.data.activeItems}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Low stock</span>
                    <span
                      className={`font-medium ${
                        inventoryStats.data.lowStockItems > 0
                          ? "text-amber-600"
                          : ""
                      }`}
                    >
                      {inventoryStats.data.lowStockItems}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warehouses</span>
                    <span className="font-medium">
                      {inventoryStats.data.totalWarehouses}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      )}

      {showFinance && (
        <Link href="/finance" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-violet-600 text-[20px]">
                    account_balance
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Finance</p>
                  <p className="text-xs text-muted-foreground">Summary</p>
                </div>
              </div>
              {financeStats.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : financeStats.data ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total assets</span>
                    <span className="font-medium">
                      {formatCurrency(Number(financeStats.data.totalAssets))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net income</span>
                    <span className="font-medium">
                      {formatCurrency(financeStats.data.netIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending JEs</span>
                    <span className="font-medium">
                      {financeStats.data.pendingEntries}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      )}

      {showPayroll && (
        <Link href="/payroll" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-pink-600 text-[20px]">
                    people
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Payroll / HR</p>
                  <p className="text-xs text-muted-foreground">Overview</p>
                </div>
              </div>
              {employeeStats.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : employeeStats.data ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employees</span>
                    <span className="font-medium">
                      {employeeStats.data.activeEmployees}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New hires (YTD)</span>
                    <span className="font-medium">
                      {employeeStats.data.newHires}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Pending time off
                    </span>
                    <span
                      className={`font-medium ${
                        employeeStats.data.pendingTimeOff > 0
                          ? "text-amber-600"
                          : ""
                      }`}
                    >
                      {employeeStats.data.pendingTimeOff}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      )}

      {showInventory && manufacturingStats.data && (
        <Link href="/manufacturing" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sky-600 text-[20px]">
                    precision_manufacturing
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Manufacturing</p>
                  <p className="text-xs text-muted-foreground">Work orders</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In progress</span>
                  <span className="font-medium">
                    {manufacturingStats.data.inProgressWorkOrders}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Completed (month)
                  </span>
                  <span className="font-medium">
                    {manufacturingStats.data.completedThisMonth}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending QC</span>
                  <span
                    className={`font-medium ${
                      manufacturingStats.data.pendingInspections > 0
                        ? "text-amber-600"
                        : ""
                    }`}
                  >
                    {manufacturingStats.data.pendingInspections}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}

// --- Main Dashboard ---

export default function DashboardPage() {
  const { data: session } = useSession();
  const { hasModuleAccess } = usePermissions();

  const showSales = hasModuleAccess("sales");
  const showSetup = hasModuleAccess("setup");

  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening across your business today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {showSales ? <SalesKpis /> : <FallbackKpis />}
      </div>

      {/* Quick Actions + Recent Sales Orders */}
      {showSales ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions />
          <RecentSalesOrders />
        </div>
      ) : (
        <QuickActions />
      )}

      {/* Module Overview Cards */}
      <ModuleOverviewCards />

      {/* Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsCard />
        {showSetup ? (
          <RecentActivity />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <span className="material-symbols-outlined text-[32px] mb-2 block">
                  history
                </span>
                <p className="text-sm">Activity log requires setup access</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
