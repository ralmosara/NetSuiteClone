import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json({ error: "Export type required" }, { status: 400 });
    }

    let data: any[] = [];
    let filename = "";

    switch (type) {
      case "customers":
        const customers = await prisma.customer.findMany({
          orderBy: { companyName: "asc" },
          include: { currency: true },
        });
        data = customers.map((c) => ({
          "Customer ID": c.customerId,
          "Company Name": c.companyName,
          "Display Name": c.displayName,
          "Email": c.email,
          "Phone": c.phone,
          "Industry": c.industry,
          "Website": c.website,
          "Billing Address": [c.billingAddress1, c.billingCity, c.billingState, c.billingCountry].filter(Boolean).join(", "),
          "Credit Limit": c.creditLimit,
          "Payment Terms": c.paymentTerms,
          "Status": c.status,
          "Created": c.createdAt.toISOString().split("T")[0],
        }));
        filename = `customers-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      case "vendors":
        const vendors = await prisma.vendor.findMany({
          orderBy: { companyName: "asc" },
        });
        data = vendors.map((v) => ({
          "Vendor ID": v.vendorId,
          "Company Name": v.companyName,
          "Display Name": v.displayName,
          "Email": v.email,
          "Phone": v.phone,
          "Address": [v.address1, v.city, v.state, v.country].filter(Boolean).join(", "),
          "Payment Terms": v.paymentTerms,
          "Tax Number": v.taxNumber,
          "Status": v.status,
          "Created": v.createdAt.toISOString().split("T")[0],
        }));
        filename = `vendors-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      case "items":
        const items = await prisma.item.findMany({
          orderBy: { name: "asc" },
          include: { preferredVendor: true },
        });
        data = items.map((i) => ({
          "Item ID": i.itemId,
          "Name": i.name,
          "Display Name": i.displayName,
          "Description": i.description,
          "Type": i.itemType,
          "Sale Price": Number(i.basePrice),
          "Cost": Number(i.cost),
          "Preferred Vendor": i.preferredVendor?.companyName,
          "Reorder Point": i.reorderPoint,
          "Track Inventory": i.trackInventory ? "Yes" : "No",
          "Active": i.isActive ? "Yes" : "No",
        }));
        filename = `items-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      case "sales-orders":
        const salesOrders = await prisma.salesOrder.findMany({
          orderBy: { createdAt: "desc" },
          include: { customer: true, currency: true },
        });
        data = salesOrders.map((o) => ({
          "Order Number": o.orderNumber,
          "Customer": o.customer.companyName,
          "Order Date": o.orderDate.toISOString().split("T")[0],
          "Expected Ship": o.expectedShipDate?.toISOString().split("T")[0],
          "Status": o.status,
          "Subtotal": Number(o.subtotal),
          "Tax": Number(o.taxAmount),
          "Total": Number(o.total),
          "Currency": o.currency?.code,
        }));
        filename = `sales-orders-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      case "invoices":
        const invoices = await prisma.invoice.findMany({
          orderBy: { createdAt: "desc" },
          include: { customer: true, currency: true },
        });
        data = invoices.map((i) => ({
          "Invoice Number": i.invoiceNumber,
          "Customer": i.customer.companyName,
          "Invoice Date": i.invoiceDate.toISOString().split("T")[0],
          "Due Date": i.dueDate.toISOString().split("T")[0],
          "Status": i.status,
          "Total": Number(i.total),
          "Amount Paid": Number(i.amountPaid),
          "Amount Due": Number(i.amountDue),
          "Currency": i.currency?.code,
        }));
        filename = `invoices-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      case "purchase-orders":
        const purchaseOrders = await prisma.purchaseOrder.findMany({
          orderBy: { createdAt: "desc" },
          include: { vendor: true, currency: true },
        });
        data = purchaseOrders.map((p) => ({
          "PO Number": p.poNumber,
          "Vendor": p.vendor.companyName,
          "Order Date": p.orderDate.toISOString().split("T")[0],
          "Expected Receipt": p.expectedReceiptDate?.toISOString().split("T")[0],
          "Status": p.status,
          "Subtotal": Number(p.subtotal),
          "Tax": Number(p.taxAmount),
          "Total": Number(p.total),
          "Currency": p.currency?.code,
        }));
        filename = `purchase-orders-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      case "balance-sheet":
        const accounts = await prisma.account.findMany({
          orderBy: [{ accountType: "asc" }, { accountNumber: "asc" }],
        });
        data = accounts.map((a) => ({
          "Account Number": a.accountNumber,
          "Account Name": a.name,
          "Type": a.accountType,
          "Balance": Number(a.balance),
          "Description": a.description,
        }));
        filename = `chart-of-accounts-${new Date().toISOString().split("T")[0]}.xlsx`;
        break;

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length)
      );
      return { wch: Math.min(maxLen + 2, maxWidth) };
    });
    worksheet["!cols"] = colWidths;

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel export:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
