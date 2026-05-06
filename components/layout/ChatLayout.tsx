"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function ChatLayout() {
  const { user } = useUser();
  const { dbUser } = useCurrentUser();
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");

  useOnlineStatus(user?.id);

  const handleSelectConversation = (id: Id<"conversations">) => {
    setSelectedConversationId(id);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("sidebar");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          ${mobileView === "sidebar" ? "flex" : "hidden"} 
          md:flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-none flex-shrink-0
        `}
      >
        <Sidebar
          currentClerkId={user.id}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat area */}
      <div
        className={`
          ${mobileView === "chat" ? "flex" : "hidden"} 
          md:flex flex-1 flex-col overflow-hidden
        `}
      >
        {selectedConversationId ? (
          <ChatArea
            conversationId={selectedConversationId}
            currentClerkId={user.id}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-violet-800">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-300 mb-2">Welcome to Urai</h2>
              <p className="text-green-400">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
