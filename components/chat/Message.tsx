"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Trash2, Smile } from "lucide-react";
import { Avatar } from "./Avatar";
import { formatMessageTime, REACTION_EMOJIS, cn } from "@/lib/utils";

interface MessageProps {
  message: Doc<"messages">;
  isMine: boolean;
  senderUser?: { name: string; imageUrl?: string | null } | null;
  showAvatar: boolean;
  showName: boolean;
  currentClerkId: string;
  isGroup: boolean;
}

export function Message({
  message,
  isMine,
  senderUser,
  showAvatar,
  showName,
  currentClerkId,
  isGroup,
}: MessageProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const addReaction = useMutation(api.messages.addReaction);

  const handleDelete = async () => {
    await deleteMessage({ messageId: message._id, userId: currentClerkId });
  };

  const handleReaction = async (emoji: string) => {
    await addReaction({ messageId: message._id, userId: currentClerkId, emoji });
    setShowEmojiPicker(false);
  };

  // Group reactions by emoji
  const reactionMap: Record<string, string[]> = {};
  for (const r of message.reactions ?? []) {
    if (!reactionMap[r.emoji]) reactionMap[r.emoji] = [];
    reactionMap[r.emoji].push(r.userId);
  }

  return (
    <div
      className={cn("flex gap-2 group", isMine ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar */}
      {isGroup && !isMine ? (
        <div className="flex-shrink-0 self-end w-8">
          {showAvatar && senderUser && (
            <Avatar imageUrl={senderUser.imageUrl} name={senderUser.name} size="sm" />
          )}
        </div>
      ) : null}

      <div className={cn("flex flex-col max-w-[70%]", isMine ? "items-end" : "items-start")}>
        {/* Sender name (group) */}
        {showName && senderUser && !isMine && (
          <span className="text-xs font-semibold text-gray-500 mb-1 px-1">{senderUser.name}</span>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl max-w-full break-words",
              isMine
                ? "bg-slate-200 text-black rounded-br-sm"
                : " bg-green-400 text-gray-900 shadow-sm border border-green-100en-100 rounded-bl-sm",
              message.isDeleted && "opacity-60"
            )}
          >
            {message.isDeleted ? (
              <em className="text-sm opacity-80">This message was deleted</em>
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}
          </div>

          {/* Action buttons */}
          {!message.isDeleted && showActions && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-10",
                isMine ? "right-full mr-2" : "left-full ml-2"
              )}
            >
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition text-gray-500"
                >
                  <Smile size={14} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-1 flex gap-1 bg-white rounded-full shadow-xl border border-gray-100 p-1.5 z-20"
                    style={{ [isMine ? "right" : "left"]: 0 }}>
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="hover:scale-125 transition-transform text-lg w-7 h-7 flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isMine && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition text-gray-400"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactionMap).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactionMap).map(([emoji, users]) => {
              const iReacted = users.includes(currentClerkId);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    "flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full border transition",
                    iReacted
                      ? "bg-violet-100 border-violet-300 text-violet-700"
                      : "bg-white border-none text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-1">
          {formatMessageTime(message._creationTime)}
        </span>
      </div>
    </div>
  );
}
