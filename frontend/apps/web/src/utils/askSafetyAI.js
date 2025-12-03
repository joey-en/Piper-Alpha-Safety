// frontend/apps/web/src/utils/askSafetyAI.js

// ========== CONFIGURATION ==========
// Point this at your FastAPI backend
const BACKEND_URL = "http://localhost:8000/api/ask";
// ====================================

/**
 * Ask the Safety AI backend a question and get structured safety information
 * @param {string} question - The safety-related question
 * @returns {Promise<Object>} Structured response with answer, clauses, etc.
 */
export async function askSafetyAI(question) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Backend error: ${response.status} - ${
          errorData.detail || response.statusText
        }`,
      );
    }

    const data = await response.json();
    // Backend returns: { answer: string, clause_ids: string[] }


    const normalized = {
      answer: data.answer || "",
      clause_ids: data.clause_ids || [],
      clause_details: {}, // still empty for now
      steps: data.steps || [],
      ppe: data.ppe || [],
      isCritical: Boolean(data.isCritical),
      type: data.type || "standard",
    };


    return {
      success: true,
      data: normalized,
    };
  } catch (error) {
    console.error("Error calling Safety AI backend:", error);
    return {
      success: false,
      error:
        error.message ||
        "Failed to get safety information from backend. Please try again.",
    };
  }
}

/**
 * Mock response for testing without backend
 */
export function mockSafetyAI(question) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isCritical =
        question.toLowerCase().includes("leak") ||
        question.toLowerCase().includes("spill") ||
        question.toLowerCase().includes("fire");

      resolve({
        success: true,
        data: {
          answer: isCritical
            ? "STOP WORK IMMEDIATELY. This is a critical safety situation requiring immediate evacuation and supervisor notification."
            : "Based on OSHA regulations, proper PPE must be worn at all times when handling chemical substances. Follow lockout/tagout procedures before maintenance.",
          clause_ids: ["OSHA-1910.119", "PSM-XIV.B.2", "NFPA-704"],
          clause_details: {
            "OSHA-1910.119":
              "Process Safety Management of Highly Hazardous Chemicals - Requires employers to prevent or minimize the consequences of catastrophic releases of toxic, reactive, flammable, or explosive chemicals.",
            "PSM-XIV.B.2":
              "Emergency Planning and Response - Establish and implement written procedures to handle small releases of highly hazardous chemicals.",
            "NFPA-704":
              "Standard System for the Identification of the Hazards of Materials for Emergency Response - Provides a readily recognized, easily understood system for identifying hazards.",
          },
          steps: [
            "Conduct hazard assessment of the work area",
            "Verify all equipment is properly tagged and locked out",
            "Don required PPE before entering the area",
            "Establish communication with safety monitor",
            "Complete work using approved procedures",
            "Remove lockout/tagout devices only after verification",
          ],
          ppe: [
            "Chemical-resistant gloves",
            "Safety goggles",
            "Face shield",
            "Chemical apron",
            "Steel-toe boots",
          ],
          isCritical: isCritical,
          type: isCritical ? "critical" : "standard",
        },
      });
    }, 1500);
  });
}
