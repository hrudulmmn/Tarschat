"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, ChevronDown, Send } from "lucide-react";
import { Avatar } from "./Avatar";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
  currentClerkId: string;
  onBack: () => void;
}

export function ChatArea({ conversationId, currentClerkId, onBack }: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const conversation = useQuery(api.conversations.getConversation, { conversationId });
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
    currentUserId: currentClerkId,
  });

  const otherUserIds = conversation?.participantIds.filter((id) => id !== currentClerkId) ?? [];
  const otherUsers = useQuery(api.users.getUsersByClerkIds, { clerkIds: otherUserIds });

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.readReceipts.markRead);
  const setTyping = useMutation(api.typing.setTyping);

  // Mark read when conversation opens
  useEffect(() => {
    markRead({ conversationId, userId: currentClerkId });
  }, [conversationId, currentClerkId, markRead]);

  // Mark read when new messages arrive and we're at bottom
  useEffect(() => {
    if (isAtBottom && messages?.length) {
      markRead({ conversationId, userId: currentClerkId });
    }
  }, [messages, isAtBottom, conversationId, currentClerkId, markRead]);

  // Auto scroll
  useEffect(() => {
    if (!messages) return;
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
    } else {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentClerkId) {
        setHasNewMessages(true);
      }
    }
  }, [messages, isAtBottom, currentClerkId]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100;
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessages(false);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setHasNewMessages(false);
    markRead({ conversationId, userId: currentClerkId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Typing indicator
    setTyping({ conversationId, userId: currentClerkId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping({ conversationId, userId: currentClerkId, isTyping: false });
    }, 2000);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    setSendError(null);
    setTyping({ conversationId, userId: currentClerkId, isTyping: false });

    try {
      await sendMessage({
        conversationId,
        senderId: currentClerkId,
        content: text,
      });
      setIsAtBottom(true);
    } catch (err) {
      setSendError("Failed to send. Tap to retry.");
      setInputText(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation || !otherUsers) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  const isGroup = conversation.type === "group";
  const displayName = isGroup
    ? conversation.groupName ?? "Group Chat"
    : otherUsers[0]?.name ?? "Unknown";
  const otherUser = !isGroup ? otherUsers[0] : null;

  // Build typing text
  let typingText = "";
  if (typingUsers && typingUsers.length > 0) {
    const typingIds = typingUsers.map((t) => t.userId);
    const typingPeople = otherUsers.filter((u) => typingIds.includes(u.clerkId));
    if (typingPeople.length === 1) {
      typingText = `${typingPeople[0].name} is typing`;
    } else if (typingPeople.length > 1) {
      typingText = "Several people are typing";
    }
  }

  return (
    <div className="flex flex-col h-full bg-violet-800">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-zinc-900 border-b border-none shadow-sm">
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative">
          {isGroup ? (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {(conversation.groupName ?? "G")[0].toUpperCase()}
            </div>
          ) : (
            <Avatar
              imageUrl={otherUser?.imageUrl}
              name={otherUser?.name ?? "?"}
              size="sm"
              isOnline={otherUser?.isOnline}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">{displayName}</h2>
          <p className="text-xs text-gray-500">
            {typingText ? (
              <span className="text-violet-500 animate-pulse">{typingText}...</span>
            ) : isGroup ? (
              `${conversation.participantIds.length} members`
            ) : otherUser?.isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span className="text-red-400">Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1"
      >
        {messages === undefined ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-5xl mb-3">👋</div>
            <p className="text-gray-600 font-medium">Start the conversation!</p>
            <p className="text-gray-400 text-sm mt-1">Send a message to get started</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const isMine = msg.senderId === currentClerkId;
            const senderUser = otherUsers.find((u) => u.clerkId === msg.senderId);
            const showAvatar = isGroup && !isMine && (
              !prevMsg || prevMsg.senderId !== msg.senderId
            );
            const showName = isGroup && !isMine && (
              !prevMsg || prevMsg.senderId !== msg.senderId
            );

            return (
              <Message
                key={msg._id}
                message={msg}
                isMine={isMine}
                senderUser={senderUser}
                showAvatar={showAvatar}
                showName={showName}
                currentClerkId={currentClerkId}
                isGroup={isGroup}
              />
            );
          })
        )}
        {typingText && <TypingIndicator text={typingText} />}
        <div ref={messagesEndRef} />
      </div>

      {/* New messages button */}
      {hasNewMessages && (
        <div className="absolute bottom-20 right-6">
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-2 bg-violet-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-violet-600 transition-colors text-sm font-medium animate-bounce"
          >
            <ChevronDown size={16} />
            New messages
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-zinc-900 border-t border-none">
        {sendError && (
          <div className="mb-2 text-sm text-red-500 flex items-center gap-2">
            <span>{sendError}</span>
            <button
              onClick={() => { setSendError(null); handleSend(); }}
              className="text-violet-500 underline"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition text-white"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              inputText.trim()
                ? "bg-violet-500 hover:bg-violet-600 text-white shadow-md"
                : "bg-gray-200 text-black cursor-not-allowed"
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={cn("flex gap-3 animate-pulse", i % 3 === 0 ? "justify-end" : "")}>
          {i % 3 !== 0 && <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />}
          <div className={cn("space-y-1", i % 3 === 0 ? "items-end" : "items-start", "flex flex-col")}>
            <div className={cn("h-10 bg-gray-200 rounded-2xl", i % 3 === 0 ? "w-48" : "w-56")} />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
