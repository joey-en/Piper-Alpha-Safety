import { AlertTriangle, Phone } from "lucide-react";

export default function AlertCard() {
  return (
    <div className="mt-4 p-5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] dark:from-[#991B1B] dark:to-[#7F1D1D] border-2 border-[#991B1B] dark:border-[#DC2626] rounded-2xl shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-[#FEE2E2] rounded-full flex items-center justify-center">
          <AlertTriangle
            size={20}
            className="text-[#DC2626] dark:text-[#991B1B]"
          />
        </div>
        <div>
          <h4 className="font-bold text-white text-base mb-1">
            ⚠️ STOP WORK - CRITICAL SAFETY ALERT
          </h4>
          <p className="text-[#FEE2E2] dark:text-[#FECACA] text-sm">
            This situation requires immediate action. Do not proceed with work.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#450A0A] bg-opacity-20 dark:bg-opacity-40 rounded-xl p-4 backdrop-blur-sm">
        <h5 className="font-semibold text-white text-sm mb-2">
          Immediate Actions Required:
        </h5>
        <ul className="space-y-1.5 text-[#FEE2E2] dark:text-[#FECACA] text-sm">
          <li className="flex items-start gap-2">
            <span className="text-white">1.</span>
            <span>Evacuate the immediate area</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white">2.</span>
            <span>Alert all nearby personnel</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white">3.</span>
            <span>Contact supervisor immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white">4.</span>
            <span>Call emergency response if needed</span>
          </li>
        </ul>
      </div>

      <button className="mt-4 w-full bg-white dark:bg-[#FEE2E2] text-[#DC2626] dark:text-[#991B1B] font-bold py-3 px-4 rounded-xl hover:bg-[#FEE2E2] dark:hover:bg-white transition-colors flex items-center justify-center gap-2">
        <Phone size={16} />
        Escalate to Supervisor
      </button>
    </div>
  );
}
