import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const msgId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      isDeleted: false,
      reactions: [],
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageId: msgId,
      lastMessageTime: Date.now(),
    });

    return msgId;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages"), userId: v.string() },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.senderId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const reactions = msg.reactions ?? [];
    const existingIdx = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === args.userId
    );

    if (existingIdx >= 0) {
      // Remove reaction
      reactions.splice(existingIdx, 1);
    } else {
      reactions.push({ emoji: args.emoji, userId: args.userId });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});

export const getLastMessage = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .first();
  },
});
