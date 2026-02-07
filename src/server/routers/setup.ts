import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const setupRouter = router({
  // Users
  getUser: protectedProcedure
    .use(createPermissionMiddleware("setup:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          phone: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: { id: true, name: true, description: true },
          },
          subsidiary: {
            select: { id: true, name: true, code: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  getUserStats: protectedProcedure.use(createPermissionMiddleware("setup:view")).query(async ({ ctx }) => {
    const [totalUsers, activeUsers, rolesCount] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.user.count({ where: { isActive: true } }),
      ctx.prisma.role.count(),
    ]);

    return { totalUsers, activeUsers, rolesCount };
  }),

  getUsers: protectedProcedure
    .use(createPermissionMiddleware("setup:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        search: z.string().optional(),
        roleId: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.roleId) where.roleId = input.roleId;
      if (input.isActive !== undefined) where.isActive = input.isActive;
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { name: "asc" },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            phone: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            role: {
              select: { id: true, name: true },
            },
            subsidiary: {
              select: { id: true, name: true, code: true },
            },
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return { users, total, pages: Math.ceil(total / input.limit) };
    }),

  createUser: protectedProcedure
    .use(createPermissionMiddleware("setup:create"))
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(8),
        roleId: z.string(),
        subsidiaryId: z.string().optional(),
        departmentId: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          ...input,
          password: hashedPassword,
        },
        include: { role: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "User",
          entityId: user.id,
        },
      });

      return user;
    }),

  updateUser: protectedProcedure
    .use(createPermissionMiddleware("setup:edit"))
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        roleId: z.string().optional(),
        subsidiaryId: z.string().optional().nullable(),
        departmentId: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const user = await ctx.prisma.user.update({
        where: { id },
        data,
        include: { role: true },
      });

      return user;
    }),

  resetUserPassword: protectedProcedure
    .use(createPermissionMiddleware("setup:edit"))
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  // Roles
  getRoles: protectedProcedure.use(createPermissionMiddleware("setup:view")).query(async ({ ctx }) => {
    return ctx.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  getRole: protectedProcedure
    .use(createPermissionMiddleware("setup:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
        include: {
          permissions: {
            include: { permission: true },
          },
          users: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return role;
    }),

  createRole: protectedProcedure
    .use(createPermissionMiddleware("setup:create"))
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.array(
          z.object({
            permissionId: z.string(),
            accessLevel: z.enum(["view", "create", "edit", "full"]),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.create({
        data: {
          name: input.name,
          description: input.description,
          permissions: input.permissions
            ? {
                create: input.permissions.map((p) => ({
                  permissionId: p.permissionId,
                  accessLevel: p.accessLevel,
                })),
              }
            : undefined,
        },
        include: { permissions: { include: { permission: true } } },
      });

      return role;
    }),

  updateRole: protectedProcedure
    .use(createPermissionMiddleware("setup:edit"))
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const role = await ctx.prisma.role.findUnique({ where: { id } });
      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      }
      if (role.isSystem) {
        throw new TRPCError({ code: "FORBIDDEN", message: "System roles cannot be modified" });
      }

      const updated = await ctx.prisma.role.update({
        where: { id },
        data,
        include: {
          _count: { select: { users: true } },
          permissions: { include: { permission: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Role",
          entityId: id,
          oldValue: role as any,
          newValue: updated as any,
        },
      });

      return updated;
    }),

  deleteRole: protectedProcedure
    .use(createPermissionMiddleware("setup:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({
        where: { id: input.id },
        include: { _count: { select: { users: true } } },
      });

      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      }
      if (role.isSystem) {
        throw new TRPCError({ code: "FORBIDDEN", message: "System roles cannot be deleted" });
      }
      if (role._count.users > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete role with ${role._count.users} assigned user(s). Reassign them first.`,
        });
      }

      await ctx.prisma.rolePermission.deleteMany({ where: { roleId: input.id } });
      await ctx.prisma.role.delete({ where: { id: input.id } });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          entityType: "Role",
          entityId: input.id,
          oldValue: role as any,
        },
      });

      return { success: true };
    }),

  duplicateRole: protectedProcedure
    .use(createPermissionMiddleware("setup:create"))
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.prisma.role.findUnique({
        where: { id: input.id },
        include: { permissions: true },
      });

      if (!source) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Source role not found" });
      }

      const role = await ctx.prisma.role.create({
        data: {
          name: input.name,
          description: source.description ? `Copy of ${source.name}: ${source.description}` : `Copy of ${source.name}`,
          permissions: {
            create: source.permissions.map((p) => ({
              permissionId: p.permissionId,
              accessLevel: p.accessLevel,
            })),
          },
        },
        include: {
          _count: { select: { users: true } },
          permissions: { include: { permission: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Role",
          entityId: role.id,
          newValue: { ...role, duplicatedFrom: source.name } as any,
        },
      });

      return role;
    }),

  updateRolePermissions: protectedProcedure
    .use(createPermissionMiddleware("setup:edit"))
    .input(
      z.object({
        roleId: z.string(),
        permissions: z.array(
          z.object({
            permissionId: z.string(),
            accessLevel: z.enum(["view", "create", "edit", "full"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findUnique({ where: { id: input.roleId } });
      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      }
      if (role.isSystem) {
        throw new TRPCError({ code: "FORBIDDEN", message: "System role permissions cannot be modified" });
      }

      // Delete existing permissions
      await ctx.prisma.rolePermission.deleteMany({
        where: { roleId: input.roleId },
      });

      // Create new permissions
      if (input.permissions.length > 0) {
        await ctx.prisma.rolePermission.createMany({
          data: input.permissions.map((p) => ({
            roleId: input.roleId,
            permissionId: p.permissionId,
            accessLevel: p.accessLevel,
          })),
        });
      }

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "RolePermission",
          entityId: input.roleId,
          newValue: { permissions: input.permissions } as any,
        },
      });

      return ctx.prisma.role.findUnique({
        where: { id: input.roleId },
        include: { permissions: { include: { permission: true } } },
      });
    }),

  // Permissions
  getPermissions: protectedProcedure.use(createPermissionMiddleware("setup:view")).query(async ({ ctx }) => {
    return ctx.prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { name: "asc" }],
    });
  }),

  // Custom Fields
  getCustomFields: protectedProcedure
    .use(createPermissionMiddleware("setup:view"))
    .input(
      z.object({
        recordType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.recordType) where.recordType = input.recordType;

      return ctx.prisma.customField.findMany({
        where,
        orderBy: [{ recordType: "asc" }, { displayOrder: "asc" }],
      });
    }),

  createCustomField: protectedProcedure
    .use(createPermissionMiddleware("setup:create"))
    .input(
      z.object({
        label: z.string().min(1),
        description: z.string().optional(),
        recordType: z.string(),
        fieldType: z.enum(["text", "number", "date", "list", "checkbox", "currency"]),
        listSource: z.string().optional(),
        defaultValue: z.string().optional(),
        isMandatory: z.boolean().optional(),
        showInList: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate field ID
      const fieldId = `custfield_${input.label.toLowerCase().replace(/\s+/g, "_")}`;

      return ctx.prisma.customField.create({
        data: {
          fieldId,
          ...input,
        },
      });
    }),

  // Audit Log
  getAuditLogs: protectedProcedure
    .use(createPermissionMiddleware("setup:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
        userId: z.string().optional(),
        entityType: z.string().optional(),
        action: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.userId) where.userId = input.userId;
      if (input.entityType) where.entityType = input.entityType;
      if (input.action) where.action = input.action;
      if (input.dateFrom || input.dateTo) {
        where.timestamp = {};
        if (input.dateFrom) where.timestamp.gte = input.dateFrom;
        if (input.dateTo) where.timestamp.lte = input.dateTo;
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { timestamp: "desc" },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        ctx.prisma.auditLog.count({ where }),
      ]);

      return { logs, total, pages: Math.ceil(total / input.limit) };
    }),

  // Subsidiaries
  getSubsidiaries: protectedProcedure.use(createPermissionMiddleware("setup:view")).query(async ({ ctx }) => {
    return ctx.prisma.subsidiary.findMany({
      include: {
        currency: true,
        parent: true,
        _count: {
          select: { users: true, employees: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Global Search
  globalSearch: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const searchTerm = input.query;

      const [customers, vendors, salesOrders, purchaseOrders, items, employees] =
        await Promise.all([
          ctx.prisma.customer.findMany({
            where: {
              OR: [
                { companyName: { contains: searchTerm, mode: "insensitive" } },
                { customerId: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, customerId: true, companyName: true, email: true },
          }),
          ctx.prisma.vendor.findMany({
            where: {
              OR: [
                { companyName: { contains: searchTerm, mode: "insensitive" } },
                { vendorId: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, vendorId: true, companyName: true },
          }),
          ctx.prisma.salesOrder.findMany({
            where: {
              OR: [
                { orderNumber: { contains: searchTerm, mode: "insensitive" } },
                { customer: { companyName: { contains: searchTerm, mode: "insensitive" } } },
              ],
            },
            take: 5,
            include: { customer: { select: { companyName: true } } },
          }),
          ctx.prisma.purchaseOrder.findMany({
            where: {
              OR: [
                { poNumber: { contains: searchTerm, mode: "insensitive" } },
                { vendor: { companyName: { contains: searchTerm, mode: "insensitive" } } },
              ],
            },
            take: 5,
            include: { vendor: { select: { companyName: true } } },
          }),
          ctx.prisma.item.findMany({
            where: {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { itemId: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, itemId: true, name: true },
          }),
          ctx.prisma.employee.findMany({
            where: {
              OR: [
                { firstName: { contains: searchTerm, mode: "insensitive" } },
                { lastName: { contains: searchTerm, mode: "insensitive" } },
                { employeeId: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, employeeId: true, firstName: true, lastName: true },
          }),
        ]);

      return {
        customers,
        vendors,
        salesOrders,
        purchaseOrders,
        items,
        employees,
      };
    }),
});
