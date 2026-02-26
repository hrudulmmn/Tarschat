"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { formatConversationTime, cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

interface ConversationItemProps {
  conversation: Doc<"conversations">;
  currentClerkId: string;
  isSelected: boolean;
  onSelect: () => void;
  searchQuery: string;
}

export function ConversationItem({
  conversation,
  currentClerkId,
  isSelected,
  onSelect,
  searchQuery,
}: ConversationItemProps) {
  const otherUserIds = conversation.participantIds.filter((id) => id !== currentClerkId);
  const otherUsers = useQuery(api.users.getUsersByClerkIds, { clerkIds: otherUserIds });
  const lastMessage = useQuery(
    api.messages.getLastMessage,
    { conversationId: conversation._id }
  );
  const unreadCount = useQuery(api.readReceipts.getUnreadCount, {
    conversationId: conversation._id,
    userId: currentClerkId,
  });

  if (!otherUsers) return null;

  const isGroup = conversation.type === "group";
  const displayName = isGroup
    ? conversation.groupName ?? "Group Chat"
    : otherUsers[0]?.name ?? "Unknown User";

  // Filter by search
  if (searchQuery && !displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  const otherUser = !isGroup ? otherUsers[0] : null;
  const isOnline = otherUser?.isOnline ?? false;

  let previewText = "No messages yet";
  if (lastMessage) {
    if (lastMessage.isDeleted) {
      previewText = "This message was deleted";
    } else {
      const isMine = lastMessage.senderId === currentClerkId;
      previewText = `${isMine ? "You: " : ""}${lastMessage.content}`;
    }
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors text-left",
        isSelected && "bg-zinc-900 border-r-2 border-violet-500"
      )}
    >
      <div className="relative flex-shrink-0">
        {isGroup ? (
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {(conversation.groupName ?? "G")[0].toUpperCase()}
          </div>
        ) : (
          <Avatar
            imageUrl={otherUser?.imageUrl}
            name={otherUser?.name ?? "?"}
            size="md"
          />
        )}
        {!isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white truncate text-sm">{displayName}</span>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {conversation.lastMessageTime && (
              <span className="text-xs text-gray-500">
                {formatConversationTime(conversation.lastMessageTime)}
              </span>
            )}
            {(unreadCount ?? 0) > 0 && (
              <span className="bg-violet-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {unreadCount! > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{previewText}</p>
        {isGroup && (
          <p className="text-xs text-gray-400 mt-0.5">{conversation.participantIds.length} members</p>
        )}
      </div>
    </button>
  );
}
