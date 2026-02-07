"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "./search-command";
import { NotificationCenter } from "./notification-center";
import { usePermissions } from "@/hooks/use-permissions";

const menuItems = {
  sales: [
    { title: "Sales Orders", href: "/sales/orders", icon: "receipt_long", description: "Manage customer orders" },
    { title: "Customers", href: "/sales/customers", icon: "people", description: "Customer directory" },
    { title: "Quotes", href: "/sales/quotes", icon: "request_quote", description: "Sales proposals" },
    { title: "Invoices", href: "/sales/invoices", icon: "description", description: "Billing & invoices" },
  ],
  purchasing: [
    { title: "Purchase Orders", href: "/purchasing/orders", icon: "shopping_cart", description: "Vendor orders" },
    { title: "Vendors", href: "/purchasing/vendors", icon: "storefront", description: "Supplier directory" },
  ],
  inventory: [
    { title: "Items", href: "/inventory/items", icon: "inventory_2", description: "Product catalog" },
    { title: "Warehouses", href: "/inventory/warehouses", icon: "warehouse", description: "Storage locations" },
  ],
  finance: [
    { title: "Transactions", href: "/finance/transactions", icon: "swap_horiz", description: "General ledger" },
    { title: "Chart of Accounts", href: "/finance/accounts", icon: "account_tree", description: "Account structure" },
  ],
  manufacturing: [
    { title: "Work Orders", href: "/manufacturing/work-orders", icon: "precision_manufacturing", description: "Production orders" },
    { title: "Bill of Materials", href: "/manufacturing/bom", icon: "account_tree", description: "Product assembly structures" },
  ],
  payroll: [
    { title: "Employees", href: "/payroll/employees", icon: "badge", description: "Employee directory" },
  ],
  crm: [
    { title: "Support Cases", href: "/crm/support", icon: "support_agent", description: "Customer support" },
  ],
  reports: [
    { title: "Balance Sheet", href: "/reports/balance-sheet", icon: "account_balance", description: "Financial position" },
    { title: "Income Statement", href: "/reports/income-statement", icon: "analytics", description: "Profit & Loss" },
  ],
  setup: [
    { title: "Users", href: "/setup/users", icon: "manage_accounts", description: "User management" },
    { title: "Roles", href: "/setup/roles", icon: "admin_panel_settings", description: "Permissions" },
    { title: "Audit Log", href: "/setup/audit-log", icon: "history", description: "System activity" },
  ],
};

function NavDropdownItems({ items }: { items: typeof menuItems.sales }) {
  return (
    <>
      {items.map((item) => (
        <li key={item.href}>
          <NavigationMenuLink asChild>
            <Link
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </>
  );
}

function MoreSection({ label, items }: { label: string; items: typeof menuItems.sales }) {
  return (
    <>
      <p className="px-2 py-1 mt-2 first:mt-0 text-xs font-semibold text-muted-foreground">{label}</p>
      {items.map((item) => (
        <NavigationMenuLink asChild key={item.href}>
          <Link
            href={item.href}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        </NavigationMenuLink>
      ))}
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { hasModuleAccess } = usePermissions();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("/").slice(0, 2).join("/"));
  };

  const showManufacturing = hasModuleAccess("inventory");
  const showPayroll = hasModuleAccess("payroll");
  const showCRM = hasModuleAccess("sales");
  const showReports = hasModuleAccess("reports");
  const showSetup = hasModuleAccess("setup");
  const showMore = showManufacturing || showPayroll || showCRM || showReports || showSetup;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 lg:px-6 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 dark:text-white shrink-0"
        >
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">dataset</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight whitespace-nowrap hidden md:block">
            NetSuite Clone
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive("/") ? "text-primary bg-primary/5" : "text-slate-600 hover:text-primary hover:bg-slate-100"
                  )}
                >
                  Dashboard
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Sales */}
            {hasModuleAccess("sales") && (
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(isActive("/sales") && "text-primary bg-primary/5")}>
                  Sales
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    <NavDropdownItems items={menuItems.sales} />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

            {/* Purchasing */}
            {hasModuleAccess("purchasing") && (
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(isActive("/purchasing") && "text-primary bg-primary/5")}>
                  Purchasing
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[350px] gap-1 p-2">
                    <NavDropdownItems items={menuItems.purchasing} />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

            {/* Inventory */}
            {hasModuleAccess("inventory") && (
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(isActive("/inventory") && "text-primary bg-primary/5")}>
                  Inventory
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[350px] gap-1 p-2">
                    <NavDropdownItems items={menuItems.inventory} />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

            {/* Finance */}
            {hasModuleAccess("finance") && (
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(isActive("/finance") && "text-primary bg-primary/5")}>
                  Finance
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[350px] gap-1 p-2">
                    <NavDropdownItems items={menuItems.finance} />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

            {/* More Menu */}
            {showMore && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>More</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 w-[500px] gap-1 p-2">
                    <div>
                      {showManufacturing && <MoreSection label="Manufacturing" items={menuItems.manufacturing} />}
                      {showPayroll && <MoreSection label="Payroll" items={menuItems.payroll} />}
                      {showCRM && <MoreSection label="CRM" items={menuItems.crm} />}
                    </div>
                    <div>
                      {showReports && <MoreSection label="Reports" items={menuItems.reports} />}
                      {showSetup && <MoreSection label="Setup" items={menuItems.setup} />}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <SearchCommand />

          <div className="hidden sm:flex items-center gap-1">
            <NotificationCenter />
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
              <span className="material-symbols-outlined text-[22px]">help</span>
            </Button>
            {showSetup && (
              <Link href="/setup/users">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
                  <span className="material-symbols-outlined text-[22px]">settings</span>
                </Button>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                    {session?.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/setup/users" className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/setup/users" className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer flex items-center gap-2"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden px-4 pb-2 overflow-x-auto flex gap-3 no-scrollbar">
        <Link href="/" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/") && "bg-primary/10 text-primary")}>
          Home
        </Link>
        {hasModuleAccess("sales") && (
          <Link href="/sales/orders" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/sales") && "bg-primary/10 text-primary")}>
            Sales
          </Link>
        )}
        {hasModuleAccess("purchasing") && (
          <Link href="/purchasing/orders" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/purchasing") && "bg-primary/10 text-primary")}>
            Purchasing
          </Link>
        )}
        {hasModuleAccess("inventory") && (
          <Link href="/inventory/items" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/inventory") && "bg-primary/10 text-primary")}>
            Inventory
          </Link>
        )}
        {hasModuleAccess("finance") && (
          <Link href="/finance/transactions" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/finance") && "bg-primary/10 text-primary")}>
            Finance
          </Link>
        )}
        {showReports && (
          <Link href="/reports/balance-sheet" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/reports") && "bg-primary/10 text-primary")}>
            Reports
          </Link>
        )}
        {showSetup && (
          <Link href="/setup/users" className={cn("text-sm font-medium whitespace-nowrap px-2 py-1 rounded", isActive("/setup") && "bg-primary/10 text-primary")}>
            Setup
          </Link>
        )}
      </div>
    </header>
  );
}
