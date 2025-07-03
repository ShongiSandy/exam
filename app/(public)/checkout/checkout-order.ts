// app/(public)/checkout/checkout-order.ts // <<< Use this filename
"use server";

import { z } from "zod";
import { validateRequest } from "@/auth"; // Your auth function
import prisma from "@/lib/prisma"; // Your prisma client instance
import { stripe } from "@/lib/stripe"; // Your initialized stripe client
import { Tier, OrderStatus, Prisma } from "@prisma/client";
import { orderValidationSchema } from "./order-validations"; // Make sure path is correct
// Make sure path is correct for order-types
import type {
  OrderInput,
  PrepareSessionResult,
  GetOrderDetailsResponse,
  OrderStatusResult,
  OrderWithRelations,
} from "./order-types";

// --- Tier Discount Logic (Ensure this is accurate) ---
const TIER_DISCOUNTS: Record<Tier, number> = {
  [Tier.BRONZE]: 0,
  [Tier.SILVER]: 0.05,
  [Tier.GOLD]: 0.1,
  [Tier.PLATINUM]: 0.15,
};
function calculateDiscountedPrice(price: number, tier: Tier): number {
  const discountPercentage = TIER_DISCOUNTS[tier] || 0;
  if (typeof price !== "number" || isNaN(price)) {
    console.error(`[calculateDiscountedPrice] Invalid price input: ${price}`);
    return typeof price === "number" ? price : 0;
  }
  return parseFloat((Number(price) * (1 - discountPercentage)).toFixed(2));
}

// --- Action 1: Prepare Checkout Session ---
export async function prepareCheckoutSession(
  details: OrderInput,
): Promise<PrepareSessionResult> {
  console.log("[Action] prepareCheckoutSession: Initiated.");
  try {
    // 1. Validate User & Get Tier
    const { user } = await validateRequest();
    if (!user || (user.role !== "CUSTOMER" && user.role !== "PROCUSTOMER")) {
      console.warn("[Action] prepareCheckoutSession: Authentication failed.");
      return {
        success: false,
        error: "User not authenticated or not a customer.",
      };
    }
    const userTier = user.tier;
    console.log(
      `[Action] prepareCheckoutSession: User ${user.id}, Tier ${userTier}`,
    );

    // 2. Validate Input Details
    const validationResult = orderValidationSchema.safeParse(details);
    if (!validationResult.success) {
      console.warn(
        "[Action] prepareCheckoutSession: Validation failed:",
        validationResult.error.flatten(),
      );
      const errors = validationResult.error.flatten().fieldErrors;
      const errorMsg = Object.entries(errors)
        .map(([key, value]) => `${key}: ${value?.join(", ")}`)
        .join("; ");
      return {
        success: false,
        error: `Invalid checkout details: ${errorMsg || "Please check the form."}`,
      };
    }
    const validatedDetails = validationResult.data;
    console.log("[Action] prepareCheckoutSession: Details validated.");

    // 3. Get Cart and Calculate Amount
    const userCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: { include: { variation: true } } },
    });
    if (!userCart || !userCart.cartItems || userCart.cartItems.length === 0) {
      console.warn(
        `[Action] prepareCheckoutSession: Cart empty for user ${user.id}.`,
      );
      return { success: false, error: "Cannot proceed: Cart is empty." };
    }

    let orderTotalAmount = 0;
    for (const item of userCart.cartItems) {
      if (!item.variation || typeof item.variation.price !== "number") {
        console.error(
          `[Action] prepareCheckoutSession: Invalid price for variation ${item.variationId}.`,
        );
        throw new Error(
          `Invalid price configuration for item ${item.variation.productId}`,
        );
      }
      const discountedPrice = calculateDiscountedPrice(
        item.variation.price,
        userTier,
      );
      orderTotalAmount += discountedPrice * item.quantity;
    }
    const finalTotal = parseFloat(orderTotalAmount.toFixed(2));
    const amountInCents = Math.round(finalTotal * 100);

    if (amountInCents <= 0) {
      console.warn(
        `[Action] prepareCheckoutSession: Calculated amount is zero or negative (${amountInCents}).`,
      );
      return { success: false, error: "Order amount must be positive." };
    }
    // --- ADJUST CURRENCY ---
    const currencyCode = "usd"; // <<< CHANGE TO 'zar' or your desired currency code
    console.log(
      `[Action] prepareCheckoutSession: Calculated total ${amountInCents} ${currencyCode.toUpperCase()} cents`,
    );

    // 4. Prepare Metadata for Stripe
    const metadataForStripe: Record<string, string> = {
      userId: user.id,
      userEmail: validatedDetails.email,
      tier: userTier,
      cartId: userCart.id,
      // --- Include details needed by webhook ---
      firstName: validatedDetails.firstName,
      lastName: validatedDetails.lastName,
      companyName: validatedDetails.companyName,
      countryRegion: validatedDetails.countryRegion,
      streetAddress: validatedDetails.streetAddress,
      apartmentSuite: validatedDetails.apartmentSuite ?? "",
      townCity: validatedDetails.townCity,
      province: validatedDetails.province,
      postcode: validatedDetails.postcode,
      phone: validatedDetails.phone,
      captivityBranch: validatedDetails.captivityBranch,
      methodOfCollection: validatedDetails.methodOfCollection,
      salesRep: validatedDetails.salesRep ?? "",
      referenceNumber: validatedDetails.referenceNumber ?? "",
      orderNotes: validatedDetails.orderNotes
        ? validatedDetails.orderNotes.substring(0, 490)
        : "",
      agreeTerms: String(validatedDetails.agreeTerms),
      receiveEmailReviews: String(
        validatedDetails.receiveEmailReviews ?? false,
      ),
      calculatedTotalCents: String(amountInCents),
      currency: currencyCode,
    };
    Object.entries(metadataForStripe).forEach(([key, value]) => {
      if (value.length > 500)
        console.warn(`[Action] Metadata key '${key}' exceeds 500 chars!`);
    });

    // 5. Create Stripe PaymentIntent
    console.log(
      "[Action] prepareCheckoutSession: Creating Stripe PaymentIntent...",
    );
    // --- Ensure country code is 2 letters for Stripe Address ---
    const countryCode =
      validatedDetails.countryRegion.length === 2
        ? validatedDetails.countryRegion.toUpperCase()
        : "ZA"; // Default to ZA if not 2 letters
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currencyCode,
      automatic_payment_methods: { enabled: true },
      metadata: metadataForStripe,
      description: `Order from ${validatedDetails.email} (${user.id})`,
      shipping: {
        // Pass shipping details
        name: `${validatedDetails.firstName} ${validatedDetails.lastName}`,
        phone: validatedDetails.phone,
        address: {
          line1: validatedDetails.streetAddress,
          line2: validatedDetails.apartmentSuite ?? undefined,
          city: validatedDetails.townCity,
          state: validatedDetails.province,
          postal_code: validatedDetails.postcode,
          country: countryCode, // Use 2-letter code
        },
      },
    });
    console.log(
      `[Action] prepareCheckoutSession: PaymentIntent created: ${paymentIntent.id}`,
    );

    // 6. Return Client Secret
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("[Action] prepareCheckoutSession: Critical Error:", error);
    return {
      success: false,
      error: "Could not initialize payment session due to a server error.",
    };
  }
}

// --- Action 2: Get Order Details ---
export async function getOrderDetails(
  orderId: string,
): Promise<GetOrderDetailsResponse> {
  console.log(`[Action] getOrderDetails: Fetching order ${orderId}`);
  if (!orderId) return { success: false, message: "Order ID is required." };

  try {
    // Validate user
    const { user } = await validateRequest();
    if (!user) return { success: false, message: "User not authenticated." };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { variation: { include: { product: true } } } },
        // user: true, // Optional
      },
    });

    if (!order) {
      console.warn(`[Action] getOrderDetails: Order ${orderId} not found.`);
      return { success: false, message: "Order not found.", order: null };
    }

    // Authorize
    if (order.userId !== user.id /* && user.role !== 'ADMIN' */) {
      console.warn(
        `[Action] getOrderDetails: Unauthorized attempt by user ${user.id} on order ${orderId}.`,
      );
      return {
        success: false,
        message: "You do not have permission to view this order.",
        order: null,
      };
    }

    console.log(
      `[Action] getOrderDetails: Order ${orderId} found and authorized.`,
    );
    return { success: true, order: order as OrderWithRelations };
  } catch (error) {
    console.error(
      `[Action] getOrderDetails: Error fetching order ${orderId}:`,
      error,
    );
    return {
      success: false,
      message: "An error occurred while fetching order details.",
    };
  }
}

// --- Action 3: Get Order Status By Payment Intent ---
export async function getOrderStatusByPaymentIntent(
  paymentIntentId: string,
): Promise<OrderStatusResult> {
  console.log(
    `[Action] getOrderStatusByPaymentIntent: Checking PI ${paymentIntentId}`,
  );
  if (!paymentIntentId) {
    return {
      success: false,
      status: "failed",
      error: "Payment Intent ID is missing.",
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { paymentIntentId: paymentIntentId },
      select: { id: true, status: true },
    });

    if (order) {
      console.log(
        `[Action] getOrderStatus: Found Order ${order.id} for PI ${paymentIntentId}, Status: ${order.status}`,
      );

      // <<< CORRECTED STATUS ARRAYS >>>
      // Use only the statuses defined in your OrderStatus enum
      const completedStatuses: OrderStatus[] = [
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        // Add others here if they represent a final successful state in your logic
      ];
      const failedStatuses: OrderStatus[] = [
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
        // Add others here if they represent a final failed state
      ];
      // <<< END CORRECTION >>>

      if (completedStatuses.includes(order.status)) {
        // Treat SHIPPED or DELIVERED as 'completed' for the polling page
        return { success: true, status: "completed", orderId: order.id };
      } else if (failedStatuses.includes(order.status)) {
        // Treat CANCELLED or REFUNDED as 'failed'
        return {
          success: true,
          status: "failed",
          orderId: order.id,
          error: `Order status is ${order.status}.`,
        };
      } else {
        // Assume PENDING or PROCESSING means it's still in progress
        return { success: true, status: "processing", orderId: order.id };
      }
    } else {
      console.log(
        `[Action] getOrderStatus: Order not yet found for PI ${paymentIntentId}. Assuming processing.`,
      );
      return { success: true, status: "processing", orderId: null };
    }
  } catch (error) {
    console.error(
      `[Action] getOrderStatus: Error checking status for PI ${paymentIntentId}:`,
      error,
    );
    return {
      success: false,
      status: "failed",
      error: "Server error while checking order status.",
    };
  }
}
