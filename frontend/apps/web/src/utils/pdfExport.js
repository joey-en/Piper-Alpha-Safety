/**
 * PDF Export Utility for Safety Conversations
 * Exports chat conversations to PDF for compliance documentation
 */

export function exportConversationToPDF(
  messages,
  conversationTitle = "Safety Conversation",
) {
  // Create PDF content as HTML
  const timestamp = new Date().toLocaleString();

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${conversationTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          border-bottom: 3px solid #F47B20;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #F47B20;
          margin: 0 0 10px 0;
        }
        .header .meta {
          color: #666;
          font-size: 14px;
        }
        .message {
          margin-bottom: 25px;
          padding: 15px;
          border-radius: 8px;
        }
        .user-message {
          background-color: #E8F5E9;
          border-left: 4px solid #4CAF50;
        }
        .ai-message {
          background-color: #FFF4E6;
          border-left: 4px solid #F47B20;
        }
        .message-label {
          font-weight: bold;
          margin-bottom: 8px;
          color: #F47B20;
        }
        .user-message .message-label {
          color: #4CAF50;
        }
        .clause-tag {
          display: inline-block;
          background: #FFE8CC;
          border: 1px solid #FFD699;
          color: #B8860B;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          margin: 4px 4px 4px 0;
          font-weight: 600;
        }
        .steps-list {
          background: #F0F9FF;
          border-left: 4px solid #0284C7;
          padding: 15px;
          margin-top: 15px;
          border-radius: 8px;
        }
        .steps-list h4 {
          color: #0C4A6E;
          margin: 0 0 10px 0;
        }
        .steps-list ol {
          margin: 0;
          padding-left: 20px;
        }
        .steps-list li {
          margin-bottom: 8px;
        }
        .ppe-list {
          background: #F0FDF4;
          border-left: 4px solid #16A34A;
          padding: 15px;
          margin-top: 15px;
          border-radius: 8px;
        }
        .ppe-list h4 {
          color: #14532D;
          margin: 0 0 10px 0;
        }
        .ppe-item {
          display: inline-block;
          background: white;
          border: 1px solid #86EFAC;
          color: #16A34A;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          margin: 4px 4px 4px 0;
          font-weight: 600;
        }
        .critical-alert {
          background: linear-gradient(to right, #DC2626, #B91C1C);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 15px;
          border: 2px solid #991B1B;
        }
        .critical-alert h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .critical-alert ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .disclaimer {
          background: #FEE2E2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
          padding: 12px;
          border-radius: 6px;
          margin-top: 20px;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ SafetyAI - ${conversationTitle}</h1>
        <div class="meta">
          <strong>Generated:</strong> ${timestamp}<br>
          <strong>Messages:</strong> ${messages.length}<br>
          <strong>System:</strong> SafetyAI Industrial Compliance Assistant
        </div>
      </div>
  `;

  messages.forEach((message, index) => {
    if (message.role === "user") {
      htmlContent += `
        <div class="message user-message">
          <div class="message-label">👤 USER QUESTION #${Math.floor(index / 2) + 1}</div>
          <p>${message.content}</p>
        </div>
      `;
    } else {
      const data = message.data || {};
      htmlContent += `
        <div class="message ai-message">
          <div class="message-label">🤖 SAFETYAI RESPONSE #${Math.floor(index / 2) + 1}</div>
          <p>${data.answer || ""}</p>
      `;

      // Clause IDs
      if (data.clause_ids && data.clause_ids.length > 0) {
        htmlContent += `<div style="margin-top: 12px;"><strong>Referenced Standards:</strong><br>`;
        data.clause_ids.forEach((clauseId) => {
          htmlContent += `<span class="clause-tag">${clauseId}</span>`;
          if (data.clause_details && data.clause_details[clauseId]) {
            htmlContent += `<div style="margin: 8px 0 8px 16px; font-size: 13px; color: #666;">${data.clause_details[clauseId]}</div>`;
          }
        });
        htmlContent += `</div>`;
      }

      // Critical Alert
      if (data.isCritical) {
        htmlContent += `
          <div class="critical-alert">
            <h4>⚠️ STOP WORK - CRITICAL SAFETY ALERT</h4>
            <p>This situation requires immediate action. Do not proceed with work.</p>
            <strong>Immediate Actions Required:</strong>
            <ul>
              <li>Evacuate the immediate area</li>
              <li>Alert all nearby personnel</li>
              <li>Contact supervisor immediately</li>
              <li>Call emergency response if needed</li>
            </ul>
          </div>
        `;
      }

      // Steps
      if (data.steps && data.steps.length > 0) {
        htmlContent += `
          <div class="steps-list">
            <h4>📋 Procedure Steps</h4>
            <ol>
              ${data.steps.map((step) => `<li>${step}</li>`).join("")}
            </ol>
          </div>
        `;
      }

      // PPE
      if (data.ppe && data.ppe.length > 0) {
        htmlContent += `
          <div class="ppe-list">
            <h4>🛡️ Required PPE</h4>
            <div>
              ${data.ppe.map((item) => `<span class="ppe-item">${item}</span>`).join("")}
            </div>
          </div>
        `;
      }

      htmlContent += `</div>`;
    }
  });

  htmlContent += `
      <div class="disclaimer">
        <strong>⚠️ Disclaimer:</strong> This document contains AI-generated safety guidance. 
        Always verify critical safety information with your site protocols, qualified safety personnel, 
        and official regulatory documentation before taking action.
      </div>
      
      <div class="footer">
        <p>Generated by SafetyAI - Industrial Safety Compliance Assistant</p>
        <p>For emergencies, contact your site safety team or call 911</p>
      </div>
    </body>
    </html>
  `;

  // Create and download PDF
  const printWindow = window.open("", "_blank");
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
  };
}
