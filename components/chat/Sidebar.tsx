"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";
import { Search, Plus, Users, MessageSquare } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { UserSearch } from "./UserSearch";
import { CreateGroupModal } from "./CreateGroupModal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentClerkId: string;
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
}

export function Sidebar({ currentClerkId, selectedConversationId, onSelectConversation }: SidebarProps) {
  const [tab, setTab] = useState<"chats" | "users">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);

  const conversations = useQuery(api.conversations.getUserConversations, {
    clerkId: currentClerkId,
  });

  return (
    <div className="flex flex-col h-full border-none">
      {/* Header */}
      <div className="p-4 border-b border-none bg-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">💬 Tars Chat</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 rounded-full hover:bg-violet-500 text-slate-200 transition-colors"
              title="New Group"
            >
              <Users size={18} />
            </button>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 bg-zinc-800" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-white bg-zinc-900 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-none bg-zinc-700">
        <button
          onClick={() => setTab("chats")}
          className={cn(
            "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            tab === "chats" ? "text-violet-600 border-b-2 border-violet-600 bg-zinc-800" : "text-gray-300 hover:text-gray-100"
          )}
        >
          <MessageSquare size={16} /> Chats
        </button>
        <button
          onClick={() => setTab("users")}
          className={cn(
            "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            tab === "users" ? "text-violet-600 border-b-2 border-violet-600 bg-zinc-800" : "text-gray-300 hover:text-gray-100"
          )}
        >
          <Users size={16} /> People
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-zinc-800">
        {tab === "chats" ? (
          <div>
            {conversations === undefined ? (
              <ConversationSkeleton />
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-400 font-medium">No conversations yet</p>
                <p className="text-gray-400 text-sm mt-1">Search for people to start chatting</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  currentClerkId={currentClerkId}
                  isSelected={conv._id === selectedConversationId}
                  onSelect={() => onSelectConversation(conv._id)}
                  searchQuery={searchQuery}
                />
              ))
            )}
          </div>
        ) : (
          <UserSearch
            currentClerkId={currentClerkId}
            searchQuery={searchQuery}
            onSelectUser={onSelectConversation}
          />
        )}
      </div>

      {showGroupModal && (
        <CreateGroupModal
          currentClerkId={currentClerkId}
          onClose={() => setShowGroupModal(false)}
          onCreated={(id) => {
            setShowGroupModal(false);
            onSelectConversation(id);
          }}
        />
      )}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
