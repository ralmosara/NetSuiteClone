import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const socket = getSocket();

  if (!socket.connected) {
    socket.auth = { userId };
    socket.connect();
  }

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// Event types for type safety
export interface NotificationEvent {
  id: string;
  type: "order" | "approval" | "inventory" | "alert" | "system";
  title: string;
  message: string;
  link?: string;
  createdAt: string;
}

export interface InventoryUpdateEvent {
  itemId: string;
  itemName: string;
  locationId: string;
  oldQuantity: number;
  newQuantity: number;
}

export interface OrderStatusEvent {
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}
