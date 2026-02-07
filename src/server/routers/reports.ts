import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";

export const reportsRouter = router({
  // Balance Sheet
  getBalanceSheet: protectedProcedure
    .use(createPermissionMiddleware("reports:view"))
    .input(
      z.object({
        asOfDate: z.date().optional(),
        subsidiaryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const asOfDate = input.asOfDate || new Date();

      // Get accounts grouped by type
      const accounts = await ctx.prisma.account.findMany({
        where: {
          isActive: true,
          isSummary: false,
          ...(input.subsidiaryId ? { subsidiaryId: input.subsidiaryId } : {}),
        },
        orderBy: { accountNumber: "asc" },
      });

      const assets = accounts.filter((a) => a.accountType === "asset");
      const liabilities = accounts.filter((a) => a.accountType === "liability");
      const equity = accounts.filter((a) => a.accountType === "equity");

      const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
      const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
      const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);

      return {
        asOfDate,
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      };
    }),

  // Income Statement (P&L)
  getIncomeStatement: protectedProcedure
    .use(createPermissionMiddleware("reports:view"))
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        subsidiaryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const accounts = await ctx.prisma.account.findMany({
        where: {
          isActive: true,
          isSummary: false,
          accountType: { in: ["income", "expense", "cogs"] },
          ...(input.subsidiaryId ? { subsidiaryId: input.subsidiaryId } : {}),
        },
        orderBy: { accountNumber: "asc" },
      });

      const income = accounts.filter((a) => a.accountType === "income");
      const cogs = accounts.filter((a) => a.accountType === "cogs");
      const expenses = accounts.filter((a) => a.accountType === "expense");

      const totalIncome = income.reduce((sum, a) => sum + Number(a.balance), 0);
      const totalCOGS = cogs.reduce((sum, a) => sum + Number(a.balance), 0);
      const grossProfit = totalIncome - totalCOGS;
      const totalExpenses = expenses.reduce((sum, a) => sum + Number(a.balance), 0);
      const netIncome = grossProfit - totalExpenses;

      return {
        startDate: input.startDate,
        endDate: input.endDate,
        income,
        cogs,
        expenses,
        totalIncome,
        totalCOGS,
        grossProfit,
        totalExpenses,
        netIncome,
      };
    }),

  // Cash Flow Statement
  getCashFlowStatement: protectedProcedure
    .use(createPermissionMiddleware("reports:view"))
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        subsidiaryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // This is a simplified cash flow - in production you'd track actual cash movements
      const bankAccounts = await ctx.prisma.account.findMany({
        where: {
          subType: "bank",
          ...(input.subsidiaryId ? { subsidiaryId: input.subsidiaryId } : {}),
        },
      });

      const journalEntries = await ctx.prisma.journalEntry.findMany({
        where: {
          status: "posted",
          entryDate: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      });

      // Group by operating, investing, financing activities
      let operatingCashFlow = 0;
      let investingCashFlow = 0;
      let financingCashFlow = 0;

      for (const entry of journalEntries) {
        for (const line of entry.lines) {
          const netAmount = Number(line.debit) - Number(line.credit);

          if (line.account.accountType === "income" || line.account.accountType === "expense") {
            operatingCashFlow += netAmount;
          } else if (line.account.subType === "fixed_asset") {
            investingCashFlow += netAmount;
          } else if (line.account.accountType === "liability" && line.account.subType === "long_term") {
            financingCashFlow += netAmount;
          }
        }
      }

      const beginningCash = bankAccounts.reduce((sum, a) => sum + Number(a.balance), 0);
      const netChange = operatingCashFlow + investingCashFlow + financingCashFlow;

      return {
        startDate: input.startDate,
        endDate: input.endDate,
        operatingActivities: {
          netIncome: operatingCashFlow,
          total: operatingCashFlow,
        },
        investingActivities: {
          total: investingCashFlow,
        },
        financingActivities: {
          total: financingCashFlow,
        },
        netCashChange: netChange,
        beginningCash,
        endingCash: beginningCash + netChange,
      };
    }),

  // Sales by Customer
  getSalesByCustomer: protectedProcedure
    .use(createPermissionMiddleware("reports:view"))
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const sales = await ctx.prisma.salesOrder.groupBy({
        by: ["customerId"],
        where: {
          orderDate: {
            gte: input.startDate,
            lte: input.endDate,
          },
          status: { not: "cancelled" },
        },
        _sum: { total: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take: input.limit,
      });

      const customerIds = sales.map((s) => s.customerId);
      const customers = await ctx.prisma.customer.findMany({
        where: { id: { in: customerIds } },
      });

      return sales.map((s) => ({
        customer: customers.find((c) => c.id === s.customerId),
        totalSales: s._sum.total || 0,
        orderCount: s._count,
      }));
    }),

  // Sales by Item
  getSalesByItem: protectedProcedure
    .use(createPermissionMiddleware("reports:view"))
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const lines = await ctx.prisma.salesOrderLine.groupBy({
        by: ["itemId"],
        where: {
          salesOrder: {
            orderDate: {
              gte: input.startDate,
              lte: input.endDate,
            },
            status: { not: "cancelled" },
          },
        },
        _sum: { amount: true, quantity: true },
        orderBy: { _sum: { amount: "desc" } },
        take: input.limit,
      });

      const itemIds = lines.map((l) => l.itemId);
      const items = await ctx.prisma.item.findMany({
        where: { id: { in: itemIds } },
      });

      return lines.map((l) => ({
        item: items.find((i) => i.id === l.itemId),
        totalAmount: l._sum.amount || 0,
        totalQuantity: l._sum.quantity || 0,
      }));
    }),

  // AR Aging
  getARAgingReport: protectedProcedure
    .use(createPermissionMiddleware("reports:view")).query(async ({ ctx }) => {
    const now = new Date();

    const invoices = await ctx.prisma.invoice.findMany({
      where: {
        status: { in: ["open", "partially_paid"] },
      },
      include: { customer: true },
    });

    const aging = {
      current: [] as any[],
      days30: [] as any[],
      days60: [] as any[],
      days90: [] as any[],
      over90: [] as any[],
    };

    for (const invoice of invoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const item = {
        invoice,
        amountDue: invoice.amountDue,
        daysOverdue,
      };

      if (daysOverdue <= 0) {
        aging.current.push(item);
      } else if (daysOverdue <= 30) {
        aging.days30.push(item);
      } else if (daysOverdue <= 60) {
        aging.days60.push(item);
      } else if (daysOverdue <= 90) {
        aging.days90.push(item);
      } else {
        aging.over90.push(item);
      }
    }

    return {
      ...aging,
      totals: {
        current: aging.current.reduce((sum, i) => sum + Number(i.amountDue), 0),
        days30: aging.days30.reduce((sum, i) => sum + Number(i.amountDue), 0),
        days60: aging.days60.reduce((sum, i) => sum + Number(i.amountDue), 0),
        days90: aging.days90.reduce((sum, i) => sum + Number(i.amountDue), 0),
        over90: aging.over90.reduce((sum, i) => sum + Number(i.amountDue), 0),
      },
    };
  }),

  // AP Aging
  getAPAgingReport: protectedProcedure
    .use(createPermissionMiddleware("reports:view")).query(async ({ ctx }) => {
    const now = new Date();

    const bills = await ctx.prisma.vendorBill.findMany({
      where: {
        status: { in: ["open", "partially_paid"] },
      },
      include: { vendor: true },
    });

    const aging = {
      current: [] as any[],
      days30: [] as any[],
      days60: [] as any[],
      days90: [] as any[],
      over90: [] as any[],
    };

    for (const bill of bills) {
      const daysOverdue = Math.floor(
        (now.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const item = {
        bill,
        amountDue: bill.amountDue,
        daysOverdue,
      };

      if (daysOverdue <= 0) {
        aging.current.push(item);
      } else if (daysOverdue <= 30) {
        aging.days30.push(item);
      } else if (daysOverdue <= 60) {
        aging.days60.push(item);
      } else if (daysOverdue <= 90) {
        aging.days90.push(item);
      } else {
        aging.over90.push(item);
      }
    }

    return {
      ...aging,
      totals: {
        current: aging.current.reduce((sum, i) => sum + Number(i.amountDue), 0),
        days30: aging.days30.reduce((sum, i) => sum + Number(i.amountDue), 0),
        days60: aging.days60.reduce((sum, i) => sum + Number(i.amountDue), 0),
        days90: aging.days90.reduce((sum, i) => sum + Number(i.amountDue), 0),
        over90: aging.over90.reduce((sum, i) => sum + Number(i.amountDue), 0),
      },
    };
  }),
});
