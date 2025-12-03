"use client";

import { useState } from "react";
import { Star, X, Trash2 } from "lucide-react";
import { getFavorites, removeFavorite } from "../utils/conversationStorage";
import MessageBubble from "./MessageBubble";

export default function FavoritesPanel({ onClose }) {
  const [favorites, setFavorites] = useState(getFavorites());

  const handleRemove = (id, e) => {
    e.stopPropagation();
    removeFavorite(id);
    setFavorites(getFavorites());
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121212] rounded-3xl max-w-3xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star size={24} className="text-[#F59E0B] fill-[#F59E0B]" />
              <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-white">
                Saved Favorites
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-xl transition-colors"
            >
              <X size={20} className="text-[#70757F] dark:text-[#A8ADB4]" />
            </button>
          </div>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Star
                size={48}
                className="mx-auto text-[#E5E7EB] dark:text-[#333333] mb-4"
              />
              <p className="text-[#70757F] dark:text-[#A8ADB4] text-sm">
                No favorites saved yet. Click the star icon on any response to
                save it.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#70757F] dark:text-[#A8ADB4]">
                      Saved {formatDate(fav.timestamp)}
                    </span>
                    <button
                      onClick={(e) => handleRemove(fav.id, e)}
                      className="p-2 hover:bg-[#FEE2E2] dark:hover:bg-[#2D1616] rounded-lg transition-all"
                    >
                      <Trash2
                        size={14}
                        className="text-[#DC2626] dark:text-[#EF4444]"
                      />
                    </button>
                  </div>
                  <MessageBubble message={fav.message} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
