import { useState } from "react";
import ClauseTag from "@/components/ClauseTag";
import StepsList from "@/components/StepsList";
import PPEList from "@/components/PPEList";
import AlertCard from "@/components/AlertCard";
import { Bot, User, Star } from "lucide-react";
import {
  addFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
} from "../utils/conversationStorage";

export default function MessageBubble({ message }) {
  const [isFavorited, setIsFavorited] = useState(checkIsFavorite(message.id));
  const isUser = message.role === "user";

  const toggleFavorite = () => {
    if (isFavorited) {
      removeFavorite(message.id);
      setIsFavorited(false);
    } else {
      addFavorite(message);
      setIsFavorited(true);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start gap-3 max-w-[80%] lg:max-w-[60%]">
          <div className="bg-gradient-to-r from-[#219079] to-[#9BC56E] dark:from-[#4DD0B1] dark:to-[#B5D16A] text-white px-5 py-3 rounded-3xl rounded-tr-md shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-[#219079] to-[#9BC56E] dark:from-[#4DD0B1] dark:to-[#B5D16A] rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  // AI message
  const data = message.data || {};

  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start gap-3 max-w-[90%] lg:max-w-[75%]">
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-[#F47B20] to-[#FF8C42] dark:from-[#D97706] dark:to-[#F59E0B] rounded-full flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>

        <div className="flex-1 bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-3xl rounded-tl-md p-5 shadow-sm">
          {/* Favorite button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleFavorite}
              className="p-1.5 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-lg transition-colors"
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                size={16}
                className={`transition-colors ${
                  isFavorited
                    ? "text-[#F59E0B] fill-[#F59E0B]"
                    : "text-[#A8ADB4] dark:text-[#70757F]"
                }`}
              />
            </button>
          </div>

          {/* Main answer */}
          <p className="text-[#1E1E1E] dark:text-white text-sm leading-relaxed mb-4">
            {data.answer}
          </p>

          {/* Clause IDs */}
          {data.clause_ids && data.clause_ids.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-[#70757F] dark:text-[#A8ADB4] mb-2 uppercase tracking-wide">
                Referenced Standards
              </div>
              <div className="flex flex-wrap gap-2">
                {data.clause_ids.map((clauseId) => (
                  <ClauseTag
                    key={clauseId}
                    clauseId={clauseId}
                    clauseText={data.clause_details?.[clauseId]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Critical Alert */}
          {data.isCritical && <AlertCard />}

          {/* Procedure Steps */}
          {data.steps && <StepsList steps={data.steps} />}

          {/* PPE List */}
          {data.ppe && <PPEList ppeItems={data.ppe} />}
        </div>
      </div>
    </div>
  );
}
