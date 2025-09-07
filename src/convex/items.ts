import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator, itemModeValidator, sizeValidator } from "./schema";

// Create a new item
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    category: categoryValidator,
    size: sizeValidator,
    condition: v.string(),
    mode: itemModeValidator,
    borrowFee: v.optional(v.number()),
    borrowDuration: v.optional(v.number()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create items");
    }

    const itemId = await ctx.db.insert("items", {
      ownerId: user._id,
      title: args.title,
      description: args.description,
      images: args.images,
      category: args.category,
      size: args.size,
      condition: args.condition,
      mode: args.mode,
      borrowFee: args.borrowFee,
      borrowDuration: args.borrowDuration,
      isAvailable: true,
      location: args.location,
    });

    return itemId;
  },
});

// Get all available items with filters
export const getAvailable = query({
  args: {
    category: v.optional(categoryValidator),
    mode: v.optional(itemModeValidator),
    size: v.optional(sizeValidator),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("items").withIndex("by_availability", (q) =>
      q.eq("isAvailable", true)
    );

    const items = await query.collect();
    
    // Filter by category if provided
    let filteredItems = items;
    if (args.category) {
      filteredItems = filteredItems.filter(item => item.category === args.category);
    }
    
    // Filter by mode if provided
    if (args.mode) {
      filteredItems = filteredItems.filter(item => 
        item.mode === args.mode || item.mode === "both"
      );
    }
    
    // Filter by size if provided
    if (args.size) {
      filteredItems = filteredItems.filter(item => item.size === args.size);
    }

    // Get owner information for each item
    const itemsWithOwners = await Promise.all(
      filteredItems.map(async (item) => {
        const owner = await ctx.db.get(item.ownerId);
        return {
          ...item,
          owner: owner ? { name: owner.name, image: owner.image } : null,
        };
      })
    );

    return itemsWithOwners;
  },
});

// Get items by owner
export const getByOwner = query({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    return items;
  },
});

// Get my items
export const getMyItems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const items = await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return items;
  },
});

// Get item by ID
export const getById = query({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      return null;
    }

    const owner = await ctx.db.get(item.ownerId);
    return {
      ...item,
      owner: owner ? { name: owner.name, image: owner.image, email: owner.email } : null,
    };
  },
});

// Update item availability
export const updateAvailability = mutation({
  args: {
    itemId: v.id("items"),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    if (item.ownerId !== user._id) {
      throw new Error("Not authorized to update this item");
    }

    await ctx.db.patch(args.itemId, {
      isAvailable: args.isAvailable,
    });
  },
});

// Delete item
export const deleteItem = mutation({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    if (item.ownerId !== user._id) {
      throw new Error("Not authorized to delete this item");
    }

    await ctx.db.delete(args.itemId);
  },
});
