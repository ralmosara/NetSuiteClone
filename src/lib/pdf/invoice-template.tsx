import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#135bec",
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 9,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  infoBlock: {
    width: "45%",
  },
  label: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    marginBottom: 8,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableColItem: {
    width: "40%",
  },
  tableColQty: {
    width: "15%",
    textAlign: "center",
  },
  tableColPrice: {
    width: "20%",
    textAlign: "right",
  },
  tableColAmount: {
    width: "25%",
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#666",
  },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  totalsBlock: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#135bec",
    color: "#fff",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerText: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  termsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  termsText: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusOpen: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusOverdue: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
});

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email?: string;
  };
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
  };
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  terms?: string;
  memo?: string;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const getStatusStyle = () => {
    switch (data.status.toLowerCase()) {
      case "paid":
        return styles.statusPaid;
      case "overdue":
        return styles.statusOverdue;
      default:
        return styles.statusOpen;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>NetSuite Clone</Text>
            <Text style={{ fontSize: 8, color: "#666", marginTop: 4 }}>
              Enterprise Resource Planning
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>{data.company.name}</Text>
            <Text>{data.company.address}</Text>
            <Text>
              {data.company.city}, {data.company.state} {data.company.postalCode}
            </Text>
            <Text>{data.company.phone}</Text>
            <Text>{data.company.email}</Text>
          </View>
        </View>

        {/* Invoice Title & Status */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={[styles.statusBadge, getStatusStyle(), { marginLeft: 15 }]}>
            <Text>{data.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={[styles.value, { fontWeight: "bold" }]}>{data.customer.name}</Text>
            <Text style={styles.value}>{data.customer.address}</Text>
            <Text style={styles.value}>
              {data.customer.city}, {data.customer.state} {data.customer.postalCode}
            </Text>
            <Text style={styles.value}>{data.customer.country}</Text>
            {data.customer.email && <Text style={styles.value}>{data.customer.email}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <View style={{ width: "50%" }}>
                <Text style={styles.label}>Invoice Number</Text>
                <Text style={[styles.value, { fontWeight: "bold" }]}>{data.invoiceNumber}</Text>
              </View>
              <View style={{ width: "50%" }}>
                <Text style={styles.label}>Invoice Date</Text>
                <Text style={styles.value}>{data.invoiceDate}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "50%" }}>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>{data.dueDate}</Text>
              </View>
              <View style={{ width: "50%" }}>
                <Text style={styles.label}>Terms</Text>
                <Text style={styles.value}>{data.terms || "Net 30"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColItem}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.tableColQty}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.tableColPrice}>
              <Text style={styles.tableHeaderText}>Unit Price</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {data.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColItem}>
                <Text>{line.description}</Text>
              </View>
              <View style={styles.tableColQty}>
                <Text>{line.quantity}</Text>
              </View>
              <View style={styles.tableColPrice}>
                <Text>${line.unitPrice.toLocaleString()}</Text>
              </View>
              <View style={styles.tableColAmount}>
                <Text>${line.amount.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${data.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={styles.totalValue}>${data.taxAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${data.total.toLocaleString()}</Text>
            </View>
            {data.amountPaid > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid</Text>
                <Text style={[styles.totalValue, { color: "#16a34a" }]}>
                  -${data.amountPaid.toLocaleString()}
                </Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Amount Due</Text>
              <Text style={styles.grandTotalValue}>${data.amountDue.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Terms & Notes */}
        {(data.terms || data.memo) && (
          <View style={styles.termsSection}>
            {data.memo && (
              <>
                <Text style={styles.termsTitle}>Notes</Text>
                <Text style={styles.termsText}>{data.memo}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business! Please remit payment by the due date.
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            Questions? Contact us at {data.company.email} or {data.company.phone}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export type { InvoiceData, InvoiceLine };
