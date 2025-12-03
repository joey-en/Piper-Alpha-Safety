import { Bot } from "lucide-react";

export default function LoadingMessage() {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-[#F47B20] to-[#FF8C42] dark:from-[#D97706] dark:to-[#F59E0B] rounded-full flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-3xl rounded-tl-md p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-[#F47B20] dark:bg-[#F59E0B] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#F47B20] dark:bg-[#F59E0B] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#F47B20] dark:bg-[#F59E0B] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <span className="text-sm text-[#70757F] dark:text-[#A8ADB4]">
              Analyzing safety requirements...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
