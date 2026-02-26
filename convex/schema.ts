import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    type: v.union(v.literal("direct"), v.literal("group")),
    participantIds: v.array(v.string()), // clerkIds
    groupName: v.optional(v.string()),
    lastMessageId: v.optional(v.id("messages")),
    lastMessageTime: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  })
    .index("by_participant", ["participantIds"])
    .index("by_last_message_time", ["lastMessageTime"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // clerkId
    content: v.string(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userId: v.string(),
        })
      )
    ),
  })
    .index("by_conversation", ["conversationId"]),

  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
    lastReadTime: v.number(),
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_user", ["userId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // clerkId
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),
});
