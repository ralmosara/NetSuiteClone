import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InvoicePDF } from "@/lib/pdf/invoice-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrder: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Transform invoice data for PDF template
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toLocaleDateString(),
      dueDate: invoice.dueDate.toLocaleDateString(),
      status: invoice.status,
      customer: {
        name: invoice.customer.companyName || invoice.customer.displayName || "Customer",
        address: invoice.customer.billingAddress1 || "",
        city: invoice.customer.billingCity || "",
        state: invoice.customer.billingState || "",
        postalCode: invoice.customer.billingPostal || "",
        country: invoice.customer.billingCountry || "",
        email: invoice.customer.email || undefined,
      },
      lines: invoice.lines.map((line) => ({
        description: line.description || line.item?.name || "Item",
        quantity: Number(line.quantity),
        unitPrice: line.unitPrice.toNumber(),
        amount: line.amount.toNumber(),
      })),
      subtotal: invoice.subtotal.toNumber(),
      taxRate: invoice.subtotal.toNumber() > 0
        ? (invoice.taxAmount.toNumber() / invoice.subtotal.toNumber()) * 100
        : 0,
      taxAmount: invoice.taxAmount.toNumber(),
      total: invoice.total.toNumber(),
      amountPaid: invoice.amountPaid.toNumber(),
      amountDue: invoice.amountDue.toNumber(),
      terms: invoice.terms || undefined,
      notes: invoice.memo || undefined,
      company: {
        name: "Your Company Name",
        address: "123 Business St, Suite 100",
        city: "City",
        state: "State",
        postalCode: "12345",
        phone: "(555) 123-4567",
        email: "billing@company.com",
      },
    };

    const pdfBuffer = await renderToBuffer(InvoicePDF({ data: pdfData }));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
