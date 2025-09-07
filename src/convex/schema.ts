import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Item modes
export const ITEM_MODES = {
  EXCHANGE: "exchange",
  BORROW: "borrow",
  BOTH: "both",
} as const;

export const itemModeValidator = v.union(
  v.literal(ITEM_MODES.EXCHANGE),
  v.literal(ITEM_MODES.BORROW),
  v.literal(ITEM_MODES.BOTH),
);
export type ItemMode = Infer<typeof itemModeValidator>;

// Item categories
export const CATEGORIES = {
  TOPS: "tops",
  BOTTOMS: "bottoms",
  DRESSES: "dresses",
  OUTERWEAR: "outerwear",
  SHOES: "shoes",
  ACCESSORIES: "accessories",
} as const;

export const categoryValidator = v.union(
  v.literal(CATEGORIES.TOPS),
  v.literal(CATEGORIES.BOTTOMS),
  v.literal(CATEGORIES.DRESSES),
  v.literal(CATEGORIES.OUTERWEAR),
  v.literal(CATEGORIES.SHOES),
  v.literal(CATEGORIES.ACCESSORIES),
);
export type Category = Infer<typeof categoryValidator>;

// Item sizes
export const SIZES = {
  XS: "xs",
  S: "s",
  M: "m",
  L: "l",
  XL: "xl",
  XXL: "xxl",
} as const;

export const sizeValidator = v.union(
  v.literal(SIZES.XS),
  v.literal(SIZES.S),
  v.literal(SIZES.M),
  v.literal(SIZES.L),
  v.literal(SIZES.XL),
  v.literal(SIZES.XXL),
);
export type Size = Infer<typeof sizeValidator>;

// Request status
export const REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
  RETURNED: "returned",
} as const;

export const requestStatusValidator = v.union(
  v.literal(REQUEST_STATUS.PENDING),
  v.literal(REQUEST_STATUS.ACCEPTED),
  v.literal(REQUEST_STATUS.REJECTED),
  v.literal(REQUEST_STATUS.COMPLETED),
  v.literal(REQUEST_STATUS.RETURNED),
);
export type RequestStatus = Infer<typeof requestStatusValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      trustScore: v.optional(v.number()), // trust score for the user
      phone: v.optional(v.string()), // phone number for coordination
      location: v.optional(v.string()), // user location for local exchanges
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Items table for clothing items
    items: defineTable({
      ownerId: v.id("users"),
      title: v.string(),
      description: v.string(),
      images: v.array(v.string()), // array of image URLs
      category: categoryValidator,
      size: sizeValidator,
      condition: v.string(), // "excellent", "good", "fair"
      mode: itemModeValidator, // exchange, borrow, or both
      borrowFee: v.optional(v.number()), // fee for borrowing (in rupees)
      borrowDuration: v.optional(v.number()), // duration in days
      isAvailable: v.boolean(),
      location: v.optional(v.string()),
    })
      .index("by_owner", ["ownerId"])
      .index("by_category", ["category"])
      .index("by_mode", ["mode"])
      .index("by_availability", ["isAvailable"]),

    // Requests table for exchange/borrow requests
    requests: defineTable({
      itemId: v.id("items"),
      requesterId: v.id("users"),
      ownerId: v.id("users"),
      type: itemModeValidator, // exchange or borrow
      status: requestStatusValidator,
      message: v.optional(v.string()), // optional message from requester
      fee: v.optional(v.number()), // fee amount if borrow
      duration: v.optional(v.number()), // duration in days if borrow
      returnDate: v.optional(v.number()), // expected return date
      paymentStatus: v.optional(v.string()), // "pending", "completed", "refunded"
    })
      .index("by_item", ["itemId"])
      .index("by_requester", ["requesterId"])
      .index("by_owner", ["ownerId"])
      .index("by_status", ["status"]),

    // Chat messages for coordination
    messages: defineTable({
      requestId: v.id("requests"),
      senderId: v.id("users"),
      content: v.string(),
      type: v.optional(v.string()), // "text", "image", "system"
    })
      .index("by_request", ["requestId"]),

    // Reviews table for user feedback
    reviews: defineTable({
      reviewerId: v.id("users"),
      revieweeId: v.id("users"),
      requestId: v.id("requests"),
      rating: v.number(), // 1-5 stars
      comment: v.optional(v.string()),
    })
      .index("by_reviewee", ["revieweeId"])
      .index("by_request", ["requestId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;