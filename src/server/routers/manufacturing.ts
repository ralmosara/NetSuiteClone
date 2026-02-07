import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";

export const manufacturingRouter = router({
  // Work Orders
  getWorkOrders: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(
      z.object({
        status: z.enum(["all", "planned", "released", "in_progress", "completed", "closed"]).optional(),
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

      if (input?.search) {
        where.OR = [
          { workOrderNumber: { contains: input.search, mode: "insensitive" } },
          { bom: { name: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const [workOrders, total] = await Promise.all([
        ctx.prisma.workOrder.findMany({
          where,
          include: {
            bom: true,
          },
          orderBy: { createdAt: "desc" },
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.prisma.workOrder.count({ where }),
      ]);

      return { workOrders, total };
    }),

  getWorkOrderById: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workOrder = await ctx.prisma.workOrder.findUnique({
        where: { id: input.id },
        include: {
          bom: {
            include: {
              components: {
                include: {
                  item: true,
                },
              },
            },
          },
          components: {
            include: {
              item: true,
            },
          },
          inspections: true,
        },
      });

      if (!workOrder) {
        throw new Error("Work order not found");
      }

      return workOrder;
    }),

  createWorkOrder: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        bomId: z.string(),
        plannedQuantity: z.number().min(1),
        plannedStartDate: z.date().optional(),
        plannedEndDate: z.date().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workOrderNumber = `WO-${Date.now().toString().slice(-8)}`;

      const workOrder = await ctx.prisma.workOrder.create({
        data: {
          workOrderNumber,
          bomId: input.bomId,
          plannedQuantity: input.plannedQuantity,
          plannedStartDate: input.plannedStartDate,
          plannedEndDate: input.plannedEndDate,
          priority: input.priority,
          memo: input.memo,
          status: "planned",
        },
        include: {
          bom: true,
        },
      });

      return workOrder;
    }),

  updateWorkOrderStatus: protectedProcedure
    .use(createPermissionMiddleware("inventory:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["planned", "released", "in_progress", "completed", "closed"]),
        actualStartDate: z.date().optional(),
        actualEndDate: z.date().optional(),
        completedQuantity: z.number().optional(),
        scrappedQuantity: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const workOrder = await ctx.prisma.workOrder.update({
        where: { id },
        data: {
          status: data.status,
          actualStartDate: data.actualStartDate,
          actualEndDate: data.actualEndDate,
          completedQuantity: data.completedQuantity,
          scrappedQuantity: data.scrappedQuantity,
        },
      });

      return workOrder;
    }),

  // Bill of Materials
  getBOMs: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { bomId: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [boms, total] = await Promise.all([
        ctx.prisma.billOfMaterial.findMany({
          where,
          include: {
            components: {
              include: {
                item: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.prisma.billOfMaterial.count({ where }),
      ]);

      return { boms, total };
    }),

  getBOMById: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bom = await ctx.prisma.billOfMaterial.findUnique({
        where: { id: input.id },
        include: {
          components: {
            include: {
              item: true,
            },
            orderBy: { lineNumber: "asc" },
          },
          workOrders: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!bom) {
        throw new Error("BOM not found");
      }

      return bom;
    }),

  createBOM: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        name: z.string().min(1),
        assemblyItemId: z.string(),
        revision: z.string().default("1.0"),
        effectiveDate: z.date().optional(),
        components: z.array(
          z.object({
            itemId: z.string(),
            quantity: z.number().min(0),
            lineNumber: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bomId = `BOM-${Date.now().toString().slice(-8)}`;

      const bom = await ctx.prisma.billOfMaterial.create({
        data: {
          bomId,
          name: input.name,
          assemblyItemId: input.assemblyItemId,
          revision: input.revision,
          effectiveDate: input.effectiveDate,
          isActive: true,
          components: {
            create: input.components.map((comp, index) => ({
              itemId: comp.itemId,
              quantity: comp.quantity,
              lineNumber: comp.lineNumber ?? index + 1,
            })),
          },
        },
        include: {
          components: {
            include: {
              item: true,
            },
          },
        },
      });

      return bom;
    }),

  // QC Inspections
  getQCInspections: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(
      z.object({
        status: z.enum(["all", "pending", "in_progress", "passed", "failed"]).optional(),
        workOrderId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.status && input.status !== "all") {
        where.status = input.status;
      }

      if (input?.workOrderId) {
        where.workOrderId = input.workOrderId;
      }

      const [inspections, total] = await Promise.all([
        ctx.prisma.qCInspection.findMany({
          where,
          include: {
            workOrder: {
              include: {
                bom: true,
              },
            },
            checklistItems: true,
          },
          orderBy: { inspectionDate: "desc" },
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.prisma.qCInspection.count({ where }),
      ]);

      return { inspections, total };
    }),

  createQCInspection: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        workOrderId: z.string(),
        inspectorName: z.string(),
        status: z.enum(["pending", "in_progress", "passed", "failed"]).default("pending"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const inspectionNumber = `QCI-${Date.now().toString().slice(-8)}`;

      const inspection = await ctx.prisma.qCInspection.create({
        data: {
          inspectionNumber,
          workOrderId: input.workOrderId,
          inspectorName: input.inspectorName,
          status: input.status,
          inspectionDate: new Date(),
        },
        include: {
          workOrder: true,
        },
      });

      return inspection;
    }),

  // Dashboard Stats
  getManufacturingStats: protectedProcedure
    .use(createPermissionMiddleware("inventory:view")).query(async ({ ctx }) => {
    const [
      totalWorkOrders,
      inProgressWorkOrders,
      completedThisMonth,
      pendingInspections,
    ] = await Promise.all([
      ctx.prisma.workOrder.count(),
      ctx.prisma.workOrder.count({ where: { status: "in_progress" } }),
      ctx.prisma.workOrder.count({
        where: {
          status: "completed",
          actualEndDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      ctx.prisma.qCInspection.count({ where: { status: "pending" } }),
    ]);

    return {
      totalWorkOrders,
      inProgressWorkOrders,
      completedThisMonth,
      pendingInspections,
    };
  }),
});
