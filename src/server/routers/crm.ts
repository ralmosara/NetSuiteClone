import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";

export const crmRouter = router({
  // Support Cases
  getSupportCases: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(
      z.object({
        status: z.enum(["all", "open", "in_progress", "waiting", "resolved", "closed"]).optional(),
        priority: z.enum(["all", "low", "medium", "high", "urgent"]).optional(),
        assignedToId: z.string().optional(),
        customerId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.status && input.status !== "all") {
        where.status = input.status;
      }

      if (input?.priority && input.priority !== "all") {
        where.priority = input.priority;
      }

      if (input?.assignedToId) {
        where.assignedToId = input.assignedToId;
      }

      if (input?.customerId) {
        where.customerId = input.customerId;
      }

      if (input?.search) {
        where.OR = [
          { caseNumber: { contains: input.search, mode: "insensitive" } },
          { subject: { contains: input.search, mode: "insensitive" } },
          { customer: { companyName: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const [cases, total] = await Promise.all([
        ctx.prisma.supportCase.findMany({
          where,
          include: {
            customer: true,
            assignedTo: true,
          },
          orderBy: { createdAt: "desc" },
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.prisma.supportCase.count({ where }),
      ]);

      return { cases, total };
    }),

  getSupportCaseById: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const supportCase = await ctx.prisma.supportCase.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          assignedTo: true,
          comments: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!supportCase) {
        throw new Error("Support case not found");
      }

      return supportCase;
    }),

  createSupportCase: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        customerId: z.string(),
        subject: z.string().min(1),
        description: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        category: z.string().optional(),
        assignedToId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const caseNumber = `CAS-${Date.now().toString().slice(-8)}`;

      const supportCase = await ctx.prisma.supportCase.create({
        data: {
          caseNumber,
          customerId: input.customerId,
          subject: input.subject,
          description: input.description,
          priority: input.priority,
          category: input.category,
          assignedToId: input.assignedToId,
          status: "open",
        },
        include: {
          customer: true,
          assignedTo: true,
        },
      });

      return supportCase;
    }),

  updateSupportCase: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedToId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const updateData: any = { ...data };

      if (data.status === "resolved") {
        updateData.resolvedAt = new Date();
      }
      if (data.status === "closed") {
        updateData.closedAt = new Date();
      }

      const supportCase = await ctx.prisma.supportCase.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          assignedTo: true,
        },
      });

      return supportCase;
    }),

  addCaseComment: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        caseId: z.string(),
        content: z.string().min(1),
        isInternal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.caseComment.create({
        data: {
          caseId: input.caseId,
          authorName: ctx.session.user.name || ctx.session.user.email || "Unknown",
          authorEmail: ctx.session.user.email,
          content: input.content,
          isInternal: input.isInternal,
        },
      });

      return comment;
    }),

  // Subscriptions
  getSubscriptions: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(
      z.object({
        status: z.enum(["all", "active", "trial", "cancelled", "expired"]).optional(),
        customerId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.status && input.status !== "all") {
        where.status = input.status;
      }

      if (input?.customerId) {
        where.customerId = input.customerId;
      }

      if (input?.search) {
        where.OR = [
          { subscriptionId: { contains: input.search, mode: "insensitive" } },
          { planName: { contains: input.search, mode: "insensitive" } },
          { customer: { companyName: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const [subscriptions, total] = await Promise.all([
        ctx.prisma.subscription.findMany({
          where,
          include: {
            customer: true,
          },
          orderBy: { createdAt: "desc" },
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.prisma.subscription.count({ where }),
      ]);

      return { subscriptions, total };
    }),

  getSubscriptionById: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.subscription.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      return subscription;
    }),

  createSubscription: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        customerId: z.string(),
        planName: z.string(),
        planType: z.enum(["monthly", "annual", "enterprise"]),
        startDate: z.date(),
        endDate: z.date().optional(),
        monthlyValue: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscriptionId = `SUB-${Date.now().toString().slice(-8)}`;

      const subscription = await ctx.prisma.subscription.create({
        data: {
          subscriptionId,
          customerId: input.customerId,
          planName: input.planName,
          planType: input.planType,
          startDate: input.startDate,
          endDate: input.endDate,
          monthlyValue: input.monthlyValue,
          status: "active",
        },
        include: {
          customer: true,
        },
      });

      return subscription;
    }),

  cancelSubscription: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        cancelReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.subscription.update({
        where: { id: input.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: input.cancelReason,
        },
      });

      return subscription;
    }),

  // Analytics
  getSubscriptionMetrics: protectedProcedure
    .use(createPermissionMiddleware("sales:view")).query(async ({ ctx }) => {
    const activeSubscriptions = await ctx.prisma.subscription.findMany({
      where: { status: "active" },
    });

    const mrr = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.monthlyValue || 0),
      0
    );
    const arr = mrr * 12;

    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [newThisMonth, churnedThisMonth, totalActive] = await Promise.all([
      ctx.prisma.subscription.count({
        where: {
          status: "active",
          startDate: { gte: thisMonth },
        },
      }),
      ctx.prisma.subscription.count({
        where: {
          status: "cancelled",
          cancelledAt: { gte: thisMonth },
        },
      }),
      ctx.prisma.subscription.count({
        where: { status: "active" },
      }),
    ]);

    const churnRate = totalActive > 0 ? (churnedThisMonth / totalActive) * 100 : 0;

    return {
      mrr,
      arr,
      activeSubscriptions: totalActive,
      newSubscriptions: newThisMonth,
      churnedSubscriptions: churnedThisMonth,
      churnRate: Math.round(churnRate * 100) / 100,
    };
  }),

  getSupportStats: protectedProcedure
    .use(createPermissionMiddleware("sales:view")).query(async ({ ctx }) => {
    const [totalCases, openCases, resolvedToday] = await Promise.all([
      ctx.prisma.supportCase.count(),
      ctx.prisma.supportCase.count({
        where: { status: { in: ["open", "in_progress", "waiting"] } },
      }),
      ctx.prisma.supportCase.count({
        where: {
          status: { in: ["resolved", "closed"] },
          resolvedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalCases,
      openCases,
      resolvedToday,
    };
  }),
});
