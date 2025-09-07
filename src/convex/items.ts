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

export const seedDemo = mutation({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const count = Math.max(1, Math.min(args.count ?? 50, 200));

    // Ensure a demo owner user exists
    const DEMO_EMAIL = "demo@rewear.local";
    let demoUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", DEMO_EMAIL))
      .unique()
      .catch(async () => null);

    if (!demoUser) {
      const demoUserId = await ctx.db.insert("users", {
        name: "Demo Seeder",
        email: DEMO_EMAIL,
        image: "https://i.pravatar.cc/100?u=rewear-demo",
        role: "user",
        trustScore: 95,
        location: "Mumbai",
      });
      demoUser = await ctx.db.get(demoUserId);
    }

    if (!demoUser) {
      throw new Error("Failed to ensure demo user");
    }

    const categories: Array<Infer<typeof import("./schema").categoryValidator>> = [
      "tops",
      "bottoms",
      "dresses",
      "outerwear",
      "shoes",
      "accessories",
    ];
    const sizes: Array<Infer<typeof import("./schema").sizeValidator>> = ["xs", "s", "m", "l", "xl", "xxl"];
    const modes: Array<Infer<typeof import("./schema").itemModeValidator>> = ["exchange", "borrow", "both"];
    const conditions: Array<string> = ["excellent", "good", "fair"];
    const cities: Array<string> = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Jaipur"];

    // A small pool of image URLs (Unsplash)
    const images: Array<string> = [
      "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975922139-1970c8f29c97?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975693411-b5461b59c88d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975619019-44d8b4f8c0b8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975657286-6c06b05f54b2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975538770-5f8bb2b3c0c0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975432361-47a974b26c9c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
    ];

    const titles = [
      "Classic Denim Jacket",
      "Casual White Tee",
      "Black Slim-fit Jeans",
      "Floral Summer Dress",
      "Cozy Knit Sweater",
      "Sporty Sneakers",
      "Elegant Silk Scarf",
      "Waterproof Windbreaker",
      "Formal Oxford Shirt",
      "Comfy Joggers",
      "Leather Chelsea Boots",
      "Checked Overshirt",
      "Linen Shorts",
      "Puffer Jacket",
      "Graphic Hoodie",
      "Pleated Skirt",
      "Canvas Tote Bag",
      "Running Shoes",
      "Chino Pants",
      "Corduroy Jacket",
    ];

    function rand<T>(arr: Array<T>): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function randInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for (let i = 0; i < count; i++) {
      const category = rand(categories);
      const size = rand(sizes);
      const mode = rand(modes);
      const condition = rand(conditions);
      const location = rand(cities);
      const title = `${rand(titles)} ${randInt(1, 99)}`;
      const img = rand(images);

      const isBorrowable = mode === "borrow" || mode === "both";
      const borrowFee = isBorrowable ? randInt(99, 599) : undefined;
      const borrowDuration = isBorrowable ? randInt(3, 14) : undefined;

      await ctx.db.insert("items", {
        ownerId: demoUser._id,
        title,
        description:
          "Lightly used, well-maintained. Great fit and perfect for casual or semi-formal occasions.",
        images: [img],
        category,
        size,
        condition,
        mode,
        borrowFee,
        borrowDuration,
        isAvailable: true,
        location,
      });
    }

    return { inserted: count };
  },
});