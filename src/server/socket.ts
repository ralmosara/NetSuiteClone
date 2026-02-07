import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Handle joining specific rooms (e.g., for order updates)
    socket.on("join:order", (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("leave:order", (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });
  });

  return io;
};

export const getSocketServer = (): SocketIOServer | null => io;

// Helper functions to emit events
export const emitNotification = (
  userId: string,
  notification: {
    id: string;
    type: "order" | "approval" | "inventory" | "alert" | "system";
    title: string;
    message: string;
    link?: string;
  }
) => {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification", {
    ...notification,
    createdAt: new Date().toISOString(),
  });
};

export const emitOrderUpdate = (
  orderId: string,
  data: {
    orderNumber: string;
    oldStatus: string;
    newStatus: string;
    updatedBy: string;
  }
) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit("order:update", {
    orderId,
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const emitInventoryUpdate = (
  data: {
    itemId: string;
    itemName: string;
    locationId: string;
    oldQuantity: number;
    newQuantity: number;
  }
) => {
  if (!io) return;
  io.emit("inventory:update", {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Broadcast to all connected clients
export const broadcast = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
};
