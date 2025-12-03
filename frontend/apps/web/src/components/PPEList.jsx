import { Shield } from "lucide-react";

export default function PPEList({ ppeItems }) {
  if (!ppeItems || ppeItems.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-[#F0FDF4] dark:bg-[#1E2E23] border border-[#BBF7D0] dark:border-[#2D4A38] rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={16} className="text-[#16A34A] dark:text-[#86EFAC]" />
        <h4 className="font-semibold text-[#14532D] dark:text-[#BBF7D0] text-sm">
          Required PPE
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {ppeItems.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center bg-white dark:bg-[#14532D] border border-[#86EFAC] dark:border-[#16A34A] text-[#16A34A] dark:text-[#86EFAC] px-3 py-1.5 rounded-xl text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
