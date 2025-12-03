import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

export default function ClauseTag({ clauseId, clauseText }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="inline-block">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 bg-[#FFF4E6] dark:bg-[#2D2416] border border-[#FFD699] dark:border-[#8B6914] text-[#B8860B] dark:text-[#FFD699] px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#FFE8CC] dark:hover:bg-[#3D3120] transition-colors"
      >
        <FileText size={12} />
        {clauseId}
        {clauseText &&
          (isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>

      {isExpanded && clauseText && (
        <div className="mt-2 p-4 bg-[#FFFBF5] dark:bg-[#1E1E1E] border border-[#FFE8CC] dark:border-[#3D3120] rounded-2xl text-sm text-[#4A4A4A] dark:text-[#D1D1D1] leading-relaxed">
          <div className="font-semibold text-[#B8860B] dark:text-[#FFD699] mb-2">
            {clauseId} - Full Text:
          </div>
          {clauseText}
        </div>
      )}
    </div>
  );
}
