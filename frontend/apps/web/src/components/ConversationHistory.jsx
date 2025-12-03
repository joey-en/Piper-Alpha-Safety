"use client";

import { useState } from "react";
import { Search, Clock, Trash2, MessageSquare, X } from "lucide-react";
import {
  getAllConversations,
  searchConversations,
  deleteConversation,
} from "../utils/conversationStorage";

export default function ConversationHistory({ onLoadConversation, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(getAllConversations());

  const handleSearch = (query) => {
    setSearchQuery(query);
    setConversations(searchConversations(query));
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      deleteConversation(id);
      setConversations(searchConversations(searchQuery));
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121212] rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare
                size={24}
                className="text-[#F47B20] dark:text-[#F59E0B]"
              />
              <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-white">
                Conversation History
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-xl transition-colors"
            >
              <X size={20} className="text-[#70757F] dark:text-[#A8ADB4]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8ADB4] dark:text-[#70757F]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#1E1E1E] dark:text-white placeholder-[#A8ADB4] dark:placeholder-[#70757F] outline-none focus:border-[#F47B20] dark:focus:border-[#F59E0B] transition-colors"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-6">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare
                size={48}
                className="mx-auto text-[#E5E7EB] dark:text-[#333333] mb-4"
              />
              <p className="text-[#70757F] dark:text-[#A8ADB4] text-sm">
                {searchQuery
                  ? "No conversations found"
                  : "No saved conversations yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onLoadConversation(conv);
                    onClose();
                  }}
                  className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl p-4 hover:border-[#F47B20] dark:hover:border-[#F59E0B] cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white mb-1 truncate">
                        {conv.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-[#70757F] dark:text-[#A8ADB4]">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatDate(conv.timestamp)}</span>
                        </div>
                        <span>•</span>
                        <span>{conv.messageCount} messages</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-[#FEE2E2] dark:hover:bg-[#2D1616] rounded-lg transition-all"
                    >
                      <Trash2
                        size={14}
                        className="text-[#DC2626] dark:text-[#EF4444]"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
