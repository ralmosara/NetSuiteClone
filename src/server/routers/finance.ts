import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";

export const financeRouter = router({
  // Currencies
  getCurrencies: protectedProcedure
    .use(createPermissionMiddleware("finance:view")).query(async ({ ctx }) => {
    return ctx.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: [{ isBase: "desc" }, { code: "asc" }],
    });
  }),

  getCurrency: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const currency = await ctx.prisma.currency.findUnique({
        where: { id: input.id },
        include: {
          exchangeRates: {
            take: 30,
            orderBy: { effectiveDate: "desc" },
          },
        },
      });

      if (!currency) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return currency;
    }),

  updateExchangeRate: protectedProcedure
    .use(createPermissionMiddleware("finance:edit"))
    .input(
      z.object({
        currencyId: z.string(),
        rate: z.number().positive(),
        effectiveDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const effectiveDate = input.effectiveDate || new Date();

      return ctx.prisma.exchangeRate.upsert({
        where: {
          currencyId_effectiveDate: {
            currencyId: input.currencyId,
            effectiveDate,
          },
        },
        update: { rate: input.rate },
        create: {
          currencyId: input.currencyId,
          rate: input.rate,
          effectiveDate,
        },
      });
    }),

  // Accounts (Chart of Accounts)
  getAccounts: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(
      z.object({
        accountType: z.string().optional(),
        isActive: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { isActive: input.isActive };
      if (input.accountType) where.accountType = input.accountType;

      return ctx.prisma.account.findMany({
        where,
        orderBy: { accountNumber: "asc" },
        include: {
          parent: true,
          subsidiary: true,
        },
      });
    }),

  getAccount: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: true,
          subsidiary: true,
          journalEntryLines: {
            take: 50,
            orderBy: { journalEntry: { entryDate: "desc" } },
            include: { journalEntry: true },
          },
        },
      });

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return account;
    }),

  createAccount: protectedProcedure
    .use(createPermissionMiddleware("finance:create"))
    .input(
      z.object({
        accountNumber: z.string().min(1),
        name: z.string().min(1),
        accountType: z.string().min(1),
        accountSubType: z.string().optional(),
        description: z.string().optional(),
        parentId: z.string().optional(),
        subsidiaryId: z.string().optional(),
        currencyId: z.string().optional(),
        isReconcilable: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.account.findUnique({
        where: { accountNumber: input.accountNumber },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Account number already exists",
        });
      }

      const account = await ctx.prisma.account.create({
        data: {
          ...input,
          balance: 0,
        },
        include: { parent: true, subsidiary: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Account",
          entityId: account.id,
          newValue: account as any,
        },
      });

      return account;
    }),

  updateAccount: protectedProcedure
    .use(createPermissionMiddleware("finance:edit"))
    .input(
      z.object({
        id: z.string(),
        accountNumber: z.string().optional(),
        name: z.string().optional(),
        accountType: z.string().optional(),
        accountSubType: z.string().optional(),
        description: z.string().optional(),
        parentId: z.string().optional().nullable(),
        subsidiaryId: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
        isReconcilable: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldAccount = await ctx.prisma.account.findUnique({ where: { id } });
      if (!oldAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      const account = await ctx.prisma.account.update({
        where: { id },
        data,
        include: { parent: true, subsidiary: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Account",
          entityId: account.id,
          oldValue: oldAccount as any,
          newValue: account as any,
        },
      });

      return account;
    }),

  getAccountStats: protectedProcedure
    .use(createPermissionMiddleware("finance:view")).query(async ({ ctx }) => {
    const [accounts, totals] = await Promise.all([
      ctx.prisma.account.findMany({
        where: { isActive: true },
      }),
      ctx.prisma.account.groupBy({
        by: ["accountType"],
        where: { isActive: true },
        _sum: { balance: true },
        _count: true,
      }),
    ]);

    const totalAssets = totals.find((t) => t.accountType === "asset")?._sum.balance || 0;
    const totalLiabilities = totals.find((t) => t.accountType === "liability")?._sum.balance || 0;
    const totalEquity = totals.find((t) => t.accountType === "equity")?._sum.balance || 0;

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((a) => a.isActive).length,
      totalAssets: Number(totalAssets),
      totalLiabilities: Number(totalLiabilities),
      totalEquity: Number(totalEquity),
      byType: totals.map((t) => ({
        type: t.accountType,
        count: t._count,
        balance: Number(t._sum.balance || 0),
      })),
    };
  }),

  // Journal Entries
  getJournalEntries: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.search) {
        where.OR = [
          { entryNumber: { contains: input.search, mode: "insensitive" } },
          { memo: { contains: input.search, mode: "insensitive" } },
        ];
      }
      if (input.dateFrom || input.dateTo) {
        where.entryDate = {};
        if (input.dateFrom) where.entryDate.gte = input.dateFrom;
        if (input.dateTo) where.entryDate.lte = input.dateTo;
      }

      const [entries, total, pendingCount, totals] = await Promise.all([
        ctx.prisma.journalEntry.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { entryDate: "desc" },
          include: {
            lines: { include: { account: true } },
          },
        }),
        ctx.prisma.journalEntry.count({ where }),
        ctx.prisma.journalEntry.count({ where: { status: "pending" } }),
        ctx.prisma.journalEntry.aggregate({
          _sum: { totalDebit: true, totalCredit: true },
        }),
      ]);

      return {
        entries,
        total,
        pages: Math.ceil(total / input.limit),
        pendingCount,
        totalDebit: totals._sum.totalDebit || 0,
        totalCredit: totals._sum.totalCredit || 0,
      };
    }),

  getJournalEntry: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.prisma.journalEntry.findUnique({
        where: { id: input.id },
        include: {
          lines: {
            include: { account: true },
            orderBy: { lineNumber: "asc" },
          },
        },
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return entry;
    }),

  updateJournalEntryStatus: protectedProcedure
    .use(createPermissionMiddleware("finance:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "approved", "posted", "void"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.journalEntry.findUnique({ where: { id: input.id } });
      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Journal entry not found" });
      }

      const updated = await ctx.prisma.journalEntry.update({
        where: { id: input.id },
        data: { status: input.status },
        include: { lines: { include: { account: true } } },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "JournalEntry",
          entityId: updated.id,
          oldValue: { status: entry.status } as any,
          newValue: { status: input.status } as any,
        },
      });

      return updated;
    }),

  createJournalEntry: protectedProcedure
    .use(createPermissionMiddleware("finance:create"))
    .input(
      z.object({
        entryDate: z.date().optional(),
        memo: z.string().optional(),
        lines: z.array(
          z.object({
            accountId: z.string(),
            debit: z.number().min(0).optional().default(0),
            credit: z.number().min(0).optional().default(0),
            memo: z.string().optional(),
          })
        ).min(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate debits = credits
      const totalDebit = input.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
      const totalCredit = input.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Total debits must equal total credits",
        });
      }

      const lastEntry = await ctx.prisma.journalEntry.findFirst({
        orderBy: { entryNumber: "desc" },
      });
      const nextNumber = lastEntry
        ? parseInt(lastEntry.entryNumber.replace("JE-", "")) + 1
        : 10001;
      const entryNumber = `JE-${nextNumber}`;

      const entry = await ctx.prisma.journalEntry.create({
        data: {
          entryNumber,
          entryDate: input.entryDate || new Date(),
          memo: input.memo,
          totalDebit,
          totalCredit,
          lines: {
            create: input.lines.map((line, index) => ({
              lineNumber: index + 1,
              accountId: line.accountId,
              debit: line.debit || 0,
              credit: line.credit || 0,
              memo: line.memo,
            })),
          },
        },
        include: {
          lines: { include: { account: true } },
        },
      });

      return entry;
    }),

  // Fixed Assets
  getFixedAssets: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        assetType: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.assetType) where.assetType = input.assetType;
      if (input.status) where.status = input.status;

      const [assets, total] = await Promise.all([
        ctx.prisma.fixedAsset.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { purchaseDate: "desc" },
          include: { account: true },
        }),
        ctx.prisma.fixedAsset.count({ where }),
      ]);

      return { assets, total, pages: Math.ceil(total / input.limit) };
    }),

  runDepreciation: protectedProcedure
    .use(createPermissionMiddleware("finance:edit"))
    .input(
      z.object({
        periodDate: z.date(),
        assetIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const where: any = {
        status: "active",
      };
      if (input.assetIds?.length) {
        where.id = { in: input.assetIds };
      }

      const assets = await ctx.prisma.fixedAsset.findMany({ where });

      const results = [];
      for (const asset of assets) {
        // Calculate monthly depreciation
        const monthlyDepreciation =
          (Number(asset.purchasePrice) - Number(asset.salvageValue)) / asset.usefulLife;

        // Check if already depreciated this period
        const existing = await ctx.prisma.depreciationEntry.findUnique({
          where: {
            fixedAssetId_periodDate: {
              fixedAssetId: asset.id,
              periodDate: input.periodDate,
            },
          },
        });

        if (existing) continue;

        // Create depreciation entry
        await ctx.prisma.depreciationEntry.create({
          data: {
            fixedAssetId: asset.id,
            periodDate: input.periodDate,
            amount: monthlyDepreciation,
          },
        });

        // Update asset
        const newAccumulated = Number(asset.accumulatedDepreciation) + monthlyDepreciation;
        const newNetBook = Number(asset.purchasePrice) - newAccumulated;

        await ctx.prisma.fixedAsset.update({
          where: { id: asset.id },
          data: {
            accumulatedDepreciation: newAccumulated,
            netBookValue: newNetBook,
            lastDepreciationDate: input.periodDate,
            status: newNetBook <= Number(asset.salvageValue) ? "fully_depreciated" : "active",
          },
        });

        results.push({
          assetId: asset.assetId,
          amount: monthlyDepreciation,
        });
      }

      return results;
    }),

  // Intercompany Transfers
  getIntercompanyTransfers: protectedProcedure
    .use(createPermissionMiddleware("finance:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;

      const [transfers, total] = await Promise.all([
        ctx.prisma.intercompanyTransfer.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { transferDate: "desc" },
          include: {
            fromSubsidiary: true,
            toSubsidiary: true,
          },
        }),
        ctx.prisma.intercompanyTransfer.count({ where }),
      ]);

      return { transfers, total, pages: Math.ceil(total / input.limit) };
    }),

  // Dashboard stats
  getDashboardStats: protectedProcedure
    .use(createPermissionMiddleware("finance:view")).query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get totals by account type
    const accountTotals = await ctx.prisma.account.groupBy({
      by: ["accountType"],
      _sum: { balance: true },
    });

    const totalAssets = accountTotals.find((a) => a.accountType === "asset")?._sum.balance || 0;
    const totalLiabilities = accountTotals.find((a) => a.accountType === "liability")?._sum.balance || 0;
    const totalEquity = accountTotals.find((a) => a.accountType === "equity")?._sum.balance || 0;
    const totalIncome = accountTotals.find((a) => a.accountType === "income")?._sum.balance || 0;
    const totalExpenses = accountTotals.find((a) => a.accountType === "expense")?._sum.balance || 0;

    const [
      pendingEntries,
      totalFixedAssets,
      monthDepreciation,
    ] = await Promise.all([
      ctx.prisma.journalEntry.count({ where: { status: "pending" } }),
      ctx.prisma.fixedAsset.aggregate({
        where: { status: "active" },
        _sum: { netBookValue: true },
      }),
      ctx.prisma.depreciationEntry.aggregate({
        where: { periodDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalIncome,
      totalExpenses,
      netIncome: Number(totalIncome) - Number(totalExpenses),
      pendingEntries,
      totalFixedAssets: totalFixedAssets._sum.netBookValue || 0,
      monthDepreciation: monthDepreciation._sum.amount || 0,
    };
  }),
});
