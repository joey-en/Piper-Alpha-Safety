import { AlertTriangle, Flame, Droplets, Zap, Wind, Phone } from "lucide-react";

export default function EmergencyQuickActions({ onActionClick }) {
  const emergencyActions = [
    {
      id: "chemical-spill",
      icon: Droplets,
      label: "Chemical Spill",
      color: "from-[#DC2626] to-[#B91C1C]",
      query:
        "What should I do if there is a chemical spill? I need immediate response procedures.",
    },
    {
      id: "fire",
      icon: Flame,
      label: "Fire Emergency",
      color: "from-[#EA580C] to-[#DC2626]",
      query: "Fire emergency protocol - what are the immediate steps to take?",
    },
    {
      id: "gas-leak",
      icon: Wind,
      label: "Gas Leak",
      color: "from-[#7C3AED] to-[#6D28D9]",
      query: "Gas leak detected - what are the emergency response procedures?",
    },
    {
      id: "electrical",
      icon: Zap,
      label: "Electrical Hazard",
      color: "from-[#F59E0B] to-[#D97706]",
      query:
        "Electrical hazard encountered - what safety measures should I take immediately?",
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle
          size={16}
          className="text-[#DC2626] dark:text-[#EF4444]"
        />
        <h3 className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] uppercase tracking-wide">
          Emergency Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {emergencyActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.query)}
              className={`bg-gradient-to-r ${action.color} text-white p-3 rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 text-sm font-semibold`}
            >
              <Icon size={16} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      <button className="mt-3 w-full bg-[#DC2626] dark:bg-[#991B1B] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#B91C1C] dark:hover:bg-[#7F1D1D] transition-colors flex items-center justify-center gap-2">
        <Phone size={16} />
        Emergency: 911
      </button>
    </div>
  );
}
