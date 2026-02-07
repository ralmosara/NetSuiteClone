import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";

export const customersRouter = router({
  getCustomers: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.search) {
        where.OR = [
          { companyName: { contains: input.search, mode: "insensitive" } },
          { displayName: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { customerId: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [customers, total] = await Promise.all([
        ctx.prisma.customer.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { companyName: "asc" },
          include: {
            currency: true,
            _count: {
              select: {
                salesOrders: true,
                invoices: true,
                contacts: true,
              },
            },
          },
        }),
        ctx.prisma.customer.count({ where }),
      ]);

      return {
        customers,
        total,
        pages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  getCustomer: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          currency: true,
          contacts: true,
          salesOrders: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: { currency: true },
          },
          invoices: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: { currency: true },
          },
          quotes: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          supportCases: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Calculate total sales YTD
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const salesYTD = await ctx.prisma.salesOrder.aggregate({
        where: {
          customerId: input.id,
          orderDate: { gte: startOfYear },
          status: { not: "cancelled" },
        },
        _sum: { total: true },
      });

      return {
        ...customer,
        salesYTD: salesYTD._sum.total || 0,
      };
    }),

  createCustomer: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        companyName: z.string().min(1),
        displayName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        billingAddress1: z.string().optional(),
        billingAddress2: z.string().optional(),
        billingCity: z.string().optional(),
        billingState: z.string().optional(),
        billingCountry: z.string().optional(),
        billingPostal: z.string().optional(),
        shippingAddress1: z.string().optional(),
        shippingAddress2: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingCountry: z.string().optional(),
        shippingPostal: z.string().optional(),
        currencyId: z.string().optional(),
        creditLimit: z.number().optional(),
        paymentTerms: z.string().optional(),
        taxExempt: z.boolean().optional(),
        taxNumber: z.string().optional(),
        salesRepId: z.string().optional(),
        leadSource: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate customer ID
      const lastCustomer = await ctx.prisma.customer.findFirst({
        orderBy: { customerId: "desc" },
      });
      const nextNumber = lastCustomer
        ? parseInt(lastCustomer.customerId.replace("CUST-", "")) + 1
        : 1001;
      const customerId = `CUST-${nextNumber}`;

      const customer = await ctx.prisma.customer.create({
        data: {
          customerId,
          ...input,
          displayName: input.displayName || input.companyName,
        },
        include: { currency: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Customer",
          entityId: customer.id,
          newValue: customer as any,
        },
      });

      return customer;
    }),

  updateCustomer: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().optional(),
        displayName: z.string().optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        website: z.string().optional().nullable(),
        industry: z.string().optional().nullable(),
        billingAddress1: z.string().optional().nullable(),
        billingAddress2: z.string().optional().nullable(),
        billingCity: z.string().optional().nullable(),
        billingState: z.string().optional().nullable(),
        billingCountry: z.string().optional().nullable(),
        billingPostal: z.string().optional().nullable(),
        shippingAddress1: z.string().optional().nullable(),
        shippingAddress2: z.string().optional().nullable(),
        shippingCity: z.string().optional().nullable(),
        shippingState: z.string().optional().nullable(),
        shippingCountry: z.string().optional().nullable(),
        shippingPostal: z.string().optional().nullable(),
        currencyId: z.string().optional().nullable(),
        creditLimit: z.number().optional().nullable(),
        paymentTerms: z.string().optional().nullable(),
        taxExempt: z.boolean().optional(),
        taxNumber: z.string().optional().nullable(),
        salesRepId: z.string().optional().nullable(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldCustomer = await ctx.prisma.customer.findUnique({
        where: { id },
      });

      if (!oldCustomer) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const customer = await ctx.prisma.customer.update({
        where: { id },
        data,
        include: { currency: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Customer",
          entityId: customer.id,
          oldValue: oldCustomer as any,
          newValue: customer as any,
        },
      });

      return customer;
    }),

  // Contacts
  getContacts: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.contact.findMany({
        where: { customerId: input.customerId },
        orderBy: [{ isPrimary: "desc" }, { lastName: "asc" }],
      });
    }),

  createContact: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        customerId: z.string(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        jobTitle: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If this is primary, unset other primary contacts
      if (input.isPrimary) {
        await ctx.prisma.contact.updateMany({
          where: { customerId: input.customerId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return ctx.prisma.contact.create({
        data: input,
      });
    }),

  // Search for autocomplete
  searchCustomers: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.customer.findMany({
        where: {
          OR: [
            { companyName: { contains: input.query, mode: "insensitive" } },
            { customerId: { contains: input.query, mode: "insensitive" } },
          ],
          status: "active",
        },
        take: 10,
        select: {
          id: true,
          customerId: true,
          companyName: true,
          email: true,
        },
      });
    }),

  deleteCustomer: protectedProcedure
    .use(createPermissionMiddleware("sales:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              salesOrders: true,
              invoices: true,
            },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      // Check if customer has related records
      if (customer._count.salesOrders > 0 || customer._count.invoices > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete customer with existing orders or invoices. Please archive the customer instead.",
        });
      }

      // Delete related contacts first
      await ctx.prisma.contact.deleteMany({
        where: { customerId: input.id },
      });

      // Delete the customer
      await ctx.prisma.customer.delete({
        where: { id: input.id },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          entityType: "Customer",
          entityId: input.id,
          oldValue: customer as any,
        },
      });

      return { success: true };
    }),

  updateContact: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        mobile: z.string().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        isPrimary: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // If setting as primary, unset other primary contacts
      if (data.isPrimary) {
        const contact = await ctx.prisma.contact.findUnique({ where: { id } });
        if (contact) {
          await ctx.prisma.contact.updateMany({
            where: { customerId: contact.customerId, isPrimary: true, id: { not: id } },
            data: { isPrimary: false },
          });
        }
      }

      return ctx.prisma.contact.update({
        where: { id },
        data,
      });
    }),

  deleteContact: protectedProcedure
    .use(createPermissionMiddleware("sales:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contact.delete({
        where: { id: input.id },
      });
    }),
});
