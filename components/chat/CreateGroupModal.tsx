"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, Check } from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
  currentClerkId: string;
  onClose: () => void;
  onCreated: (id: Id<"conversations">) => void;
}

export function CreateGroupModal({ currentClerkId, onClose, onCreated }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const users = useQuery(api.users.getAllUsers, { currentClerkId });
  const createGroup = useMutation(api.conversations.createGroup);

  const toggleUser = (clerkId: string) => {
    setSelectedIds((prev) =>
      prev.includes(clerkId) ? prev.filter((id) => id !== clerkId) : [...prev, clerkId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 1) return;
    setIsCreating(true);
    try {
      const id = await createGroup({
        name: groupName.trim(),
        memberClerkIds: [currentClerkId, ...selectedIds],
        createdBy: currentClerkId,
      });
      onCreated(id);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-none bg-zinc-800">
          <h2 className="text-lg font-semibold text-white">Create Group Chat</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-900 text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Group name */}
        <div className="p-4 bg-zinc-700 border-collapse">
          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 border border-none bg-zinc-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 bg-zinc-700">
          <p className="text-xs font-medium text-gray-200 mb-2">
            Add members ({selectedIds.length} selected)
          </p>
          {users?.map((user) => (
            <button
              key={user._id}
              onClick={() => toggleUser(user.clerkId)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition"
            >
              <Avatar imageUrl={user.imageUrl} name={user.name} size="sm" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-200">{user.name}</p>
              </div>
              {selectedIds.includes(user.clerkId) && (
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-none bg-zinc-700">
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length === 0 || isCreating}
            className={cn(
              "w-full py-2.5 rounded-xl font-semibold text-sm transition",
              groupName.trim() && selectedIds.length > 0
                ? "bg-violet-500 hover:bg-violet-600 text-white"
                : "bg-zinc-800 text-slate-200 cursor-not-allowed"
            )}
          >
            {isCreating ? "Creating..." : `Create Group (${selectedIds.length} members)`}
          </button>
        </div>
      </div>
    </div>
  );
}
