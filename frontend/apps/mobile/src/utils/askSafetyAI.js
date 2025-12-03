import { Platform } from "react-native";

// DEV ONLY: pick correct host for mobile
const BACKEND_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api/ask"   // Android emulator
    : "http://localhost:8000/api/ask"; // iOS simulator / web

// If you test on a real phone on Wi-Fi, replace BOTH with:
// "http://YOUR_PC_LAN_IP:8000/api/ask"

export async function askSafetyAI(question) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Backend ${res.status}: ${err}`);
    }

    const data = await res.json();

    return {
      success: true,
      data: {
        answer: data.answer || "",
        clause_ids: data.clause_ids || [],
        clause_details: {},
        steps: [],
        ppe: [],
        isCritical: false,
        type: "standard",
      },
    };
  } catch (error) {
    console.error("Mobile askSafetyAI error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to reach safety backend.",
    };
  }
}
