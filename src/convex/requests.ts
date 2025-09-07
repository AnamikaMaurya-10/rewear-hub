import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { itemModeValidator, requestStatusValidator } from "./schema";

// Create a new request
export const create = mutation({
  args: {
    itemId: v.id("items"),
    type: itemModeValidator,
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to make requests");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    if (item.ownerId === user._id) {
      throw new Error("Cannot request your own item");
    }

    if (!item.isAvailable) {
      throw new Error("Item is not available");
    }

    // Check if user already has a pending request for this item
    const existingRequest = await ctx.db
      .query("requests")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .filter((q) => q.eq(q.field("requesterId"), user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("You already have a pending request for this item");
    }

    const requestId = await ctx.db.insert("requests", {
      itemId: args.itemId,
      requesterId: user._id,
      ownerId: item.ownerId,
      type: args.type,
      status: "pending",
      message: args.message,
      fee: args.type === "borrow" ? item.borrowFee : undefined,
      duration: args.type === "borrow" ? item.borrowDuration : undefined,
      paymentStatus: args.type === "borrow" ? "pending" : undefined,
    });

    return requestId;
  },
});

// Get requests for my items (as owner)
export const getMyItemRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const requests = await ctx.db
      .query("requests")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Get item and requester details
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const item = await ctx.db.get(request.itemId);
        const requester = await ctx.db.get(request.requesterId);
        return {
          ...request,
          item,
          requester: requester ? { 
            name: requester.name, 
            image: requester.image,
            email: requester.email 
          } : null,
        };
      })
    );

    return requestsWithDetails;
  },
});

// Get my requests (as requester)
export const getMyRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const requests = await ctx.db
      .query("requests")
      .withIndex("by_requester", (q) => q.eq("requesterId", user._id))
      .collect();

    // Get item and owner details
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const item = await ctx.db.get(request.itemId);
        const owner = await ctx.db.get(request.ownerId);
        return {
          ...request,
          item,
          owner: owner ? { 
            name: owner.name, 
            image: owner.image,
            email: owner.email 
          } : null,
        };
      })
    );

    return requestsWithDetails;
  },
});

// Update request status
export const updateStatus = mutation({
  args: {
    requestId: v.id("requests"),
    status: requestStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Only owner can accept/reject requests
    if (request.ownerId !== user._id) {
      throw new Error("Not authorized to update this request");
    }

    await ctx.db.patch(args.requestId, {
      status: args.status,
    });

    // If accepted, mark item as unavailable
    if (args.status === "accepted") {
      await ctx.db.patch(request.itemId, {
        isAvailable: false,
      });
    }

    // If rejected, keep item available
    if (args.status === "rejected") {
      await ctx.db.patch(request.itemId, {
        isAvailable: true,
      });
    }

    // If returned (for borrow), mark item as available again
    if (args.status === "returned") {
      await ctx.db.patch(request.itemId, {
        isAvailable: true,
      });
    }
  },
});

// Mark item as returned (for borrow requests)
export const markReturned = mutation({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Only owner can mark as returned
    if (request.ownerId !== user._id) {
      throw new Error("Not authorized to update this request");
    }

    await ctx.db.patch(args.requestId, {
      status: "returned",
    });

    // Mark item as available again
    await ctx.db.patch(request.itemId, {
      isAvailable: true,
    });
  },
});
