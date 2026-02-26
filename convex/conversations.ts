import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateDirect = mutation({
  args: { currentClerkId: v.string(), otherClerkId: v.string() },
  handler: async (ctx, args) => {
    // Look for existing direct conversation between both users
    const all = await ctx.db.query("conversations").collect();
    const existing = all.find(
      (c) =>
        c.type === "direct" &&
        c.participantIds.includes(args.currentClerkId) &&
        c.participantIds.includes(args.otherClerkId) &&
        c.participantIds.length === 2
    );
    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      type: "direct",
      participantIds: [args.currentClerkId, args.otherClerkId],
      lastMessageTime: Date.now(),
    });
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    memberClerkIds: v.array(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      type: "group",
      participantIds: args.memberClerkIds,
      groupName: args.name,
      lastMessageTime: Date.now(),
      createdBy: args.createdBy,
    });
  },
});

export const getUserConversations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter((c) => c.participantIds.includes(args.clerkId));

    // Sort by lastMessageTime desc
    mine.sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));

    return mine;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});
