/**
 * Parse tRPC/Zod errors into user-friendly messages
 */
export function parseApiError(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  // Handle error object with message
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // Try to parse as tRPC error with Zod validation issues
    if (err.message && typeof err.message === "string") {
      try {
        // Check if the message is a JSON array (Zod errors)
        if (err.message.startsWith("[")) {
          const zodErrors = JSON.parse(err.message);
          if (Array.isArray(zodErrors) && zodErrors.length > 0) {
            // Extract user-friendly messages from Zod errors
            const messages = zodErrors.map((zodError: ZodErrorItem) => {
              const field = zodError.path?.join(".") || "field";
              const friendlyField = formatFieldName(field);

              // Map Zod error codes to friendly messages
              switch (zodError.code) {
                case "invalid_type":
                  if (zodError.received === "undefined" || zodError.received === "null") {
                    return `${friendlyField} is required`;
                  }
                  return `${friendlyField} must be a ${zodError.expected}`;
                case "invalid_string":
                  if (zodError.validation === "email") {
                    return `Please enter a valid email address`;
                  }
                  if (zodError.validation === "url") {
                    return `Please enter a valid URL`;
                  }
                  return `${friendlyField} is invalid`;
                case "invalid_format":
                  if (zodError.format === "email") {
                    return `Please enter a valid email address`;
                  }
                  return `${friendlyField} format is invalid`;
                case "too_small":
                  if (zodError.type === "string") {
                    if (zodError.minimum === 1) {
                      return `${friendlyField} is required`;
                    }
                    return `${friendlyField} must be at least ${zodError.minimum} characters`;
                  }
                  if (zodError.type === "number") {
                    return `${friendlyField} must be at least ${zodError.minimum}`;
                  }
                  return `${friendlyField} is too small`;
                case "too_big":
                  if (zodError.type === "string") {
                    return `${friendlyField} must be at most ${zodError.maximum} characters`;
                  }
                  if (zodError.type === "number") {
                    return `${friendlyField} must be at most ${zodError.maximum}`;
                  }
                  return `${friendlyField} is too large`;
                case "invalid_enum_value":
                  return `${friendlyField} has an invalid value`;
                case "custom":
                  return zodError.message || `${friendlyField} is invalid`;
                default:
                  return zodError.message || `${friendlyField} is invalid`;
              }
            });

            // Return unique messages joined
            return [...new Set(messages)].join(". ");
          }
        }
      } catch {
        // Not a JSON message, use as-is
      }

      // Check for common error patterns and make them friendly
      const message = err.message as string;

      // Handle Prisma unique constraint errors
      if (message.includes("Unique constraint failed")) {
        const match = message.match(/fields: \(`(\w+)`\)/);
        if (match) {
          return `A record with this ${formatFieldName(match[1])} already exists`;
        }
        return "A record with these values already exists";
      }

      // Handle foreign key constraint errors
      if (message.includes("Foreign key constraint failed")) {
        return "Referenced record not found";
      }

      // Handle required field errors
      if (message.includes("required")) {
        return message;
      }

      // Return clean message if it's already readable
      if (message.length < 200 && !message.includes("{") && !message.includes("[")) {
        return message;
      }
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    if (error.length < 200) {
      return error;
    }
  }

  return "An error occurred. Please try again.";
}

interface ZodErrorItem {
  code: string;
  path?: string[];
  message?: string;
  expected?: string;
  received?: string;
  validation?: string;
  format?: string;
  type?: string;
  minimum?: number;
  maximum?: number;
}

/**
 * Convert field names to user-friendly format
 */
function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    companyName: "Company name",
    displayName: "Display name",
    email: "Email",
    phone: "Phone number",
    customerId: "Customer",
    vendorId: "Vendor",
    itemId: "Item",
    orderId: "Order",
    invoiceId: "Invoice",
    quantity: "Quantity",
    unitPrice: "Unit price",
    amount: "Amount",
    billingAddress1: "Billing address",
    shippingAddress1: "Shipping address",
    firstName: "First name",
    lastName: "Last name",
    orderDate: "Order date",
    dueDate: "Due date",
    startDate: "Start date",
    endDate: "End date",
  };

  if (fieldMap[field]) {
    return fieldMap[field];
  }

  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
