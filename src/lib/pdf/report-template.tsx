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
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#135bec",
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#135bec",
  },
  reportMeta: {
    textAlign: "right",
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  reportSubtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  table: {
    marginBottom: 15,
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
  tableRowAlternate: {
    backgroundColor: "#fafafa",
  },
  tableRowTotal: {
    backgroundColor: "#e8f4ff",
    borderTopWidth: 2,
    borderTopColor: "#135bec",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#666",
  },
  tableCellText: {
    fontSize: 9,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: "bold",
  },
  colAccount: {
    width: "50%",
  },
  colAmount: {
    width: "25%",
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryValuePositive: {
    color: "#16a34a",
  },
  summaryValueNegative: {
    color: "#dc2626",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
  },
  pageNumber: {
    fontSize: 8,
    color: "#999",
  },
  twoColumn: {
    flexDirection: "row",
    gap: 20,
  },
  column: {
    flex: 1,
  },
});

interface ReportLine {
  account: string;
  accountNumber?: string;
  currentPeriod: number;
  previousPeriod?: number;
  variance?: number;
  isHeader?: boolean;
  isTotal?: boolean;
  indent?: number;
}

interface BalanceSheetData {
  reportTitle: string;
  reportDate: string;
  periodEnd: string;
  company: string;
  currency: string;
  assets: ReportLine[];
  liabilities: ReportLine[];
  equity: ReportLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

interface IncomeStatementData {
  reportTitle: string;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  company: string;
  currency: string;
  revenue: ReportLine[];
  expenses: ReportLine[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  previousNetIncome?: number;
}

export function BalanceSheetPDF({ data }: { data: BalanceSheetData }) {
  const renderSection = (title: string, lines: ReportLine[], total: number, totalLabel: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.colAccount}>
            <Text style={styles.tableHeaderText}>Account</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.tableHeaderText}>Current Period</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.tableHeaderText}>Prior Period</Text>
          </View>
        </View>
        {lines.map((line, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              ...(index % 2 === 1 ? [styles.tableRowAlternate] : []),
              ...(line.isTotal ? [styles.tableRowTotal] : []),
            ]}
          >
            <View style={[styles.colAccount, { paddingLeft: (line.indent || 0) * 15 }]}>
              <Text style={line.isHeader || line.isTotal ? styles.tableCellBold : styles.tableCellText}>
                {line.accountNumber ? `${line.accountNumber} - ` : ""}{line.account}
              </Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={line.isTotal ? styles.tableCellBold : styles.tableCellText}>
                ${line.currentPeriod.toLocaleString()}
              </Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={line.isTotal ? styles.tableCellBold : styles.tableCellText}>
                ${(line.previousPeriod || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
        <View style={[styles.tableRow, styles.tableRowTotal]}>
          <View style={styles.colAccount}>
            <Text style={styles.tableCellBold}>{totalLabel}</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.tableCellBold}>${total.toLocaleString()}</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.tableCellBold}>-</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>NetSuite Clone</Text>
            <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>{data.company}</Text>
          </View>
          <View style={styles.reportMeta}>
            <Text style={styles.reportTitle}>{data.reportTitle}</Text>
            <Text style={styles.reportSubtitle}>As of {data.periodEnd}</Text>
            <Text style={styles.reportSubtitle}>Currency: {data.currency}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Assets</Text>
            <Text style={styles.summaryValue}>${data.totalAssets.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Liabilities</Text>
            <Text style={styles.summaryValue}>${data.totalLiabilities.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.summaryLabel}>Total Equity</Text>
            <Text style={[styles.summaryValue, styles.summaryValuePositive]}>
              ${data.totalEquity.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Assets */}
        {renderSection("Assets", data.assets, data.totalAssets, "Total Assets")}

        {/* Liabilities */}
        {renderSection("Liabilities", data.liabilities, data.totalLiabilities, "Total Liabilities")}

        {/* Equity */}
        {renderSection("Equity", data.equity, data.totalEquity, "Total Equity")}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {data.reportDate}</Text>
          <Text style={styles.pageNumber}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
}

export function IncomeStatementPDF({ data }: { data: IncomeStatementData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>NetSuite Clone</Text>
            <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>{data.company}</Text>
          </View>
          <View style={styles.reportMeta}>
            <Text style={styles.reportTitle}>{data.reportTitle}</Text>
            <Text style={styles.reportSubtitle}>
              {data.periodStart} - {data.periodEnd}
            </Text>
            <Text style={styles.reportSubtitle}>Currency: {data.currency}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={[styles.summaryValue, styles.summaryValuePositive]}>
              ${data.totalRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, styles.summaryValueNegative]}>
              ${data.totalExpenses.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginBottom: 0, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#ddd" }]}>
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>Net Income</Text>
            <Text style={[styles.summaryValue, data.netIncome >= 0 ? styles.summaryValuePositive : styles.summaryValueNegative]}>
              ${data.netIncome.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Revenue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colAccount}>
                <Text style={styles.tableHeaderText}>Account</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableHeaderText}>Amount</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableHeaderText}>% of Revenue</Text>
              </View>
            </View>
            {data.revenue.map((line, index) => (
              <View
                key={index}
                style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlternate] : [])]}
              >
                <View style={[styles.colAccount, { paddingLeft: (line.indent || 0) * 15 }]}>
                  <Text style={line.isHeader ? styles.tableCellBold : styles.tableCellText}>
                    {line.accountNumber ? `${line.accountNumber} - ` : ""}{line.account}
                  </Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={styles.tableCellText}>${line.currentPeriod.toLocaleString()}</Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={styles.tableCellText}>
                    {((line.currentPeriod / data.totalRevenue) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
            <View style={[styles.tableRow, styles.tableRowTotal]}>
              <View style={styles.colAccount}>
                <Text style={styles.tableCellBold}>Total Revenue</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableCellBold}>${data.totalRevenue.toLocaleString()}</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableCellBold}>100%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colAccount}>
                <Text style={styles.tableHeaderText}>Account</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableHeaderText}>Amount</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableHeaderText}>% of Revenue</Text>
              </View>
            </View>
            {data.expenses.map((line, index) => (
              <View
                key={index}
                style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlternate] : [])]}
              >
                <View style={[styles.colAccount, { paddingLeft: (line.indent || 0) * 15 }]}>
                  <Text style={line.isHeader ? styles.tableCellBold : styles.tableCellText}>
                    {line.accountNumber ? `${line.accountNumber} - ` : ""}{line.account}
                  </Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={styles.tableCellText}>${line.currentPeriod.toLocaleString()}</Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={styles.tableCellText}>
                    {((line.currentPeriod / data.totalRevenue) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
            <View style={[styles.tableRow, styles.tableRowTotal]}>
              <View style={styles.colAccount}>
                <Text style={styles.tableCellBold}>Total Expenses</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableCellBold}>${data.totalExpenses.toLocaleString()}</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableCellBold}>
                  {((data.totalExpenses / data.totalRevenue) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Net Income */}
        <View style={[styles.summaryCard, { backgroundColor: data.netIncome >= 0 ? "#dcfce7" : "#fee2e2" }]}>
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={[styles.summaryLabel, { fontSize: 14, fontWeight: "bold" }]}>Net Income</Text>
            <Text style={[styles.summaryValue, { fontSize: 18 }, data.netIncome >= 0 ? styles.summaryValuePositive : styles.summaryValueNegative]}>
              ${data.netIncome.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {data.reportDate}</Text>
          <Text style={styles.pageNumber}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
}

export type { BalanceSheetData, IncomeStatementData, ReportLine };
