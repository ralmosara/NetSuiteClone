"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  type: "customer" | "order" | "invoice" | "item" | "employee" | "vendor";
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

const sampleResults: SearchResult[] = [
  { id: "1", type: "customer", title: "Global Corp Inc.", subtitle: "CUST-4921 • Technology", href: "/sales/customers/cust-1", icon: "business" },
  { id: "2", type: "customer", title: "Acme Solutions", subtitle: "CUST-3842 • Manufacturing", href: "/sales/customers/cust-2", icon: "business" },
  { id: "3", type: "order", title: "SO-10293", subtitle: "Global Corp Inc. • $6,547.41", href: "/sales/orders/so-1", icon: "receipt_long" },
  { id: "4", type: "order", title: "SO-10292", subtitle: "Acme Solutions • $3,240.00", href: "/sales/orders/so-2", icon: "receipt_long" },
  { id: "5", type: "invoice", title: "INV-2023-089", subtitle: "Global Corp Inc. • Open", href: "/sales/invoices/inv-1", icon: "description" },
  { id: "6", type: "item", title: "MacBook Pro 16\"", subtitle: "NB-PRO-16 • $2,499.00", href: "/inventory/items/item-1", icon: "inventory_2" },
  { id: "7", type: "item", title: "USB-C Multiport Adapter", subtitle: "ACC-HUB-C • $79.00", href: "/inventory/items/item-2", icon: "inventory_2" },
  { id: "8", type: "employee", title: "Sarah Jenkins", subtitle: "EMP-1018 • Sales Manager", href: "/payroll/employees/emp-4", icon: "person" },
  { id: "9", type: "vendor", title: "Apple Inc.", subtitle: "VEND-1001 • Technology", href: "/purchasing/vendors/vend-1", icon: "storefront" },
];

const quickActions = [
  { id: "new-order", title: "New Sales Order", href: "/sales/orders/new", icon: "add_shopping_cart" },
  { id: "new-customer", title: "New Customer", href: "/sales/customers/new", icon: "person_add" },
  { id: "new-invoice", title: "New Invoice", href: "/sales/invoices/new", icon: "receipt" },
  { id: "new-po", title: "New Purchase Order", href: "/purchasing/orders/new", icon: "shopping_cart" },
  { id: "new-wo", title: "New Work Order", href: "/manufacturing/work-orders/new", icon: "precision_manufacturing" },
  { id: "new-bom", title: "New BOM", href: "/manufacturing/bom/new", icon: "account_tree" },
];

const navigationItems = [
  { id: "nav-dashboard", title: "Dashboard", href: "/", icon: "dashboard" },
  { id: "nav-customers", title: "Customers", href: "/sales/customers", icon: "people" },
  { id: "nav-orders", title: "Sales Orders", href: "/sales/orders", icon: "receipt_long" },
  { id: "nav-invoices", title: "Invoices", href: "/sales/invoices", icon: "description" },
  { id: "nav-items", title: "Items", href: "/inventory/items", icon: "inventory_2" },
  { id: "nav-vendors", title: "Vendors", href: "/purchasing/vendors", icon: "storefront" },
  { id: "nav-work-orders", title: "Work Orders", href: "/manufacturing/work-orders", icon: "precision_manufacturing" },
  { id: "nav-bom", title: "Bill of Materials", href: "/manufacturing/bom", icon: "account_tree" },
  { id: "nav-employees", title: "Employees", href: "/payroll/employees", icon: "badge" },
  { id: "nav-reports", title: "Balance Sheet", href: "/reports/balance-sheet", icon: "analytics" },
];

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setSearch("");
      router.push(href);
    },
    [router]
  );

  const filteredResults = search.length > 0
    ? sampleResults.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const filteredNav = search.length > 0
    ? navigationItems.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">search</span>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center border-b px-3">
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">
              search
            </span>
            <Input
              placeholder="Search customers, orders, items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base h-12"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {search.length === 0 ? (
              <>
                {/* Quick Actions */}
                <div className="p-2">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Quick Actions
                  </p>
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action.href)}
                      className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        {action.icon}
                      </span>
                      <span>{action.title}</span>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="p-2 border-t">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Navigation
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="material-symbols-outlined text-muted-foreground text-[18px]">
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search Results */}
                {filteredResults.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Results
                    </p>
                    {filteredResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result.href)}
                        className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-muted-foreground text-[18px]">
                            {result.icon}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{result.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {result.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation Matches */}
                {filteredNav.length > 0 && (
                  <div className="p-2 border-t">
                    <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Pages
                    </p>
                    {filteredNav.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="material-symbols-outlined text-muted-foreground text-[18px]">
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredResults.length === 0 && filteredNav.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <span className="material-symbols-outlined text-[48px] mb-2">
                      search_off
                    </span>
                    <p>No results found for "{search}"</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">esc</kbd>
              to close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
