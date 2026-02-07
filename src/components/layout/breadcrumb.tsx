"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems =
    items ||
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, arr) => ({
        label: segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        href: index < arr.length - 1 ? "/" + arr.slice(0, index + 1).join("/") : undefined,
      }));

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6"
    >
      <Link href="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      {breadcrumbItems.map((item, index) => (
        <Fragment key={index}>
          <span className="material-symbols-outlined text-[16px] text-slate-400">
            chevron_right
          </span>
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="font-semibold text-slate-800 dark:text-slate-200"
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
