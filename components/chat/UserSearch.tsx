"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "./Avatar";
import { Users } from "lucide-react";

interface UserSearchProps {
  currentClerkId: string;
  searchQuery: string;
  onSelectUser: (conversationId: Id<"conversations">) => void;
}

export function UserSearch({ currentClerkId, searchQuery, onSelectUser }: UserSearchProps) {
  const users = useQuery(
    searchQuery ? api.users.searchUsers : api.users.getAllUsers,
    searchQuery
      ? { query: searchQuery, currentClerkId }
      : { currentClerkId }
  );
  const getOrCreateDirect = useMutation(api.conversations.getOrCreateDirect);

  const handleSelectUser = async (otherClerkId: string) => {
    const convId = await getOrCreateDirect({ currentClerkId, otherClerkId });
    onSelectUser(convId);
  };

  if (users === undefined) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">
          {searchQuery ? "No users found" : "No other users yet"}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {searchQuery ? "Try a different search" : "Invite friends to join!"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => handleSelectUser(user.clerkId)}
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
        >
          <Avatar imageUrl={user.imageUrl} name={user.name} size="md" isOnline={user.isOnline} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="flex-shrink-0">
            {user.isOnline ? (
              <span className="text-xs text-green-500 font-medium">Online</span>
            ) : (
              <span className="text-xs text-gray-400">Offline</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
