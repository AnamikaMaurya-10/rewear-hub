import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Send a message
export const send = mutation({
  args: {
    requestId: v.id("requests"),
    content: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to send messages");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Only requester and owner can send messages
    if (request.requesterId !== user._id && request.ownerId !== user._id) {
      throw new Error("Not authorized to send messages in this chat");
    }

    const messageId = await ctx.db.insert("messages", {
      requestId: args.requestId,
      senderId: user._id,
      content: args.content,
      type: args.type || "text",
    });

    return messageId;
  },
});

// Get messages for a request
export const getByRequest = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      return [];
    }

    // Only requester and owner can view messages
    if (request.requesterId !== user._id && request.ownerId !== user._id) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .collect();

    // Get sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender ? { 
            name: sender.name, 
            image: sender.image 
          } : null,
        };
      })
    );

    return messagesWithSenders;
  },
});
