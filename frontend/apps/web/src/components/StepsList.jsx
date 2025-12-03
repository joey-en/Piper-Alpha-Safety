import { CheckCircle2 } from "lucide-react";

export default function StepsList({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-[#F0F9FF] dark:bg-[#1E2830] border border-[#BAE6FD] dark:border-[#2D4A5C] rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2
          size={16}
          className="text-[#0284C7] dark:text-[#7DD3FC]"
        />
        <h4 className="font-semibold text-[#0C4A6E] dark:text-[#BAE6FD] text-sm">
          Procedure Steps
        </h4>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm text-[#4A4A4A] dark:text-[#D1D1D1]"
          >
            <span className="flex-shrink-0 w-6 h-6 bg-[#0284C7] dark:bg-[#0C4A6E] text-white rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <span className="pt-0.5 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
