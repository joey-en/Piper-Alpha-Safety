"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  AlertCircle,
  HardHat,
  Menu,
  X,
  History,
  Star,
  Download,
  Save,
} from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import LoadingMessage from "@/components/LoadingMessage";
import VoiceInput from "@/components/VoiceInput";
import EmergencyQuickActions from "@/components/EmergencyQuickActions";
import ConversationHistory from "@/components/ConversationHistory";
import FavoritesPanel from "@/components/FavoritesPanel";
import { askSafetyAI } from "@/utils/askSafetyAI";
import { saveConversation } from "../utils/conversationStorage";
import { exportConversationToPDF } from "../utils/pdfExport";

export default function SafetyChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Use mockSafetyAI for testing, or askSafetyAI with real API key
    const result = await askSafetyAI(userMessage.content);
    // const result = await askSafetyAI(userMessage.content); // For real OpenAI integration

    setIsLoading(false);

    if (result.success) {
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        data: result.data,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } else {
      setError(result.error);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
    setTimeout(() => handleSend(transcript), 100);
  };

  const handleSaveConversation = () => {
    if (messages.length === 0) {
      alert("No conversation to save");
      return;
    }
    const id = saveConversation(messages);
    if (id) {
      alert("Conversation saved successfully!");
    } else {
      alert("Failed to save conversation");
    }
  };

  const handleExportPDF = () => {
    if (messages.length === 0) {
      alert("No conversation to export");
      return;
    }
    exportConversationToPDF(messages);
  };

  const handleLoadConversation = (conversation) => {
    setMessages(conversation.messages);
    setSidebarOpen(false);
  };

  const handleNewConversation = () => {
    if (messages.length > 0) {
      if (
        confirm(
          "Start a new conversation? Current conversation will be cleared.",
        )
      ) {
        setMessages([]);
        setInput("");
      }
    }
  };

  const handleEmergencyAction = (query) => {
    setSidebarOpen(false);
    handleSend(query);
  };

  const quickPrompts = [
    "What PPE is required for handling sulfuric acid?",
    "Explain lockout/tagout procedures",
    "How to respond to a chemical spill?",
    "Confined space entry requirements",
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0A0A0A] font-inter flex flex-col">
      {/* Modals */}
      {showHistory && (
        <ConversationHistory
          onLoadConversation={handleLoadConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showFavorites && (
        <FavoritesPanel onClose={() => setShowFavorites(false)} />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#121212] border-b border-[#E5E7EB] dark:border-[#333333] z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-xl transition-colors"
            >
              <Menu size={20} className="text-[#1E1E1E] dark:text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F47B20] to-[#FF8C42] rounded-xl flex items-center justify-center">
                <HardHat size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#1E1E1E] dark:text-white">
                SafetyAI
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-xl transition-colors"
            >
              <History
                size={18}
                className="text-[#70757F] dark:text-[#A8ADB4]"
              />
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-xl transition-colors"
            >
              <Star size={18} className="text-[#70757F] dark:text-[#A8ADB4]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-[#121212] border-r border-[#E5E7EB] dark:border-[#333333] transition-all duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-72`}
      >
        <div className="p-6 h-full flex flex-col overflow-y-auto">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-1 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-xl transition-colors"
          >
            <X size={20} className="text-[#70757F] dark:text-[#A8ADB4]" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F47B20] to-[#FF8C42] rounded-2xl flex items-center justify-center shadow-lg">
              <HardHat size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1E1E1E] dark:text-white">
                SafetyAI
              </h1>
              <p className="text-xs text-[#70757F] dark:text-[#A8ADB4]">
                Industrial Safety Assistant
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mb-6">
            <button
              onClick={handleNewConversation}
              className="w-full bg-gradient-to-r from-[#F47B20] to-[#FF8C42] dark:from-[#D97706] dark:to-[#F59E0B] text-white font-semibold py-2.5 px-4 rounded-xl hover:shadow-lg transition-all text-sm"
            >
              + New Conversation
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] text-[#4A4A4A] dark:text-[#D1D1D1] py-2 px-3 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-[#262626] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <History size={14} />
                History
              </button>
              <button
                onClick={() => setShowFavorites(true)}
                className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] text-[#4A4A4A] dark:text-[#D1D1D1] py-2 px-3 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-[#262626] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Star size={14} />
                Saved
              </button>
              <button
                onClick={handleSaveConversation}
                disabled={messages.length === 0}
                className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] text-[#4A4A4A] dark:text-[#D1D1D1] py-2 px-3 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-[#262626] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleExportPDF}
                disabled={messages.length === 0}
                className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] text-[#4A4A4A] dark:text-[#D1D1D1] py-2 px-3 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-[#262626] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} />
                PDF
              </button>
            </div>
          </div>

          {/* Emergency Quick Actions */}
          <EmergencyQuickActions onActionClick={handleEmergencyAction} />

          {/* Info Cards */}
          <div className="space-y-3 mb-6">
            <div className="bg-[#FFF4E6] dark:bg-[#2D2416] border border-[#FFD699] dark:border-[#8B6914] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#B8860B] dark:text-[#FFD699] mb-2">
                Standards Coverage
              </h3>
              <ul className="text-xs text-[#4A4A4A] dark:text-[#D1D1D1] space-y-1">
                <li>• OSHA Regulations</li>
                <li>• PSM Guidelines</li>
                <li>• NFPA Standards</li>
                <li>• EPA Compliance</li>
              </ul>
            </div>

            <div className="bg-[#FEE2E2] dark:bg-[#2D1616] border border-[#FCA5A5] dark:border-[#991B1B] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#DC2626] dark:text-[#FCA5A5] mb-2">
                Emergency Contact
              </h3>
              <p className="text-xs text-[#4A4A4A] dark:text-[#D1D1D1]">
                For emergencies, call:
                <br />
                <span className="font-bold text-[#DC2626] dark:text-[#FCA5A5]">
                  911
                </span>{" "}
                or your site safety team
              </p>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-[#70757F] dark:text-[#A8ADB4] uppercase tracking-wide mb-3">
              Quick Questions
            </h3>
            <div className="space-y-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(prompt);
                    setSidebarOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left text-sm text-[#4A4A4A] dark:text-[#D1D1D1] bg-[#F9FAFB] dark:bg-[#1E1E1E] hover:bg-[#F3F4F6] dark:hover:bg-[#262626] px-3 py-2.5 rounded-xl transition-colors border border-[#E5E7EB] dark:border-[#333333]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#333333] mt-4">
            <p className="text-xs text-[#70757F] dark:text-[#A8ADB4] text-center">
              Always verify critical safety information with your site protocols
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:ml-72 flex flex-col h-screen pt-16 lg:pt-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F47B20] to-[#FF8C42] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <HardHat size={40} className="text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1E1E1E] dark:text-white mb-3">
                Welcome to SafetyAI
              </h2>
              <p className="text-[#70757F] dark:text-[#A8ADB4] text-base lg:text-lg mb-8">
                Your industrial safety compliance assistant. Ask about
                regulations, procedures, PPE requirements, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="text-left p-4 bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl hover:border-[#F47B20] dark:hover:border-[#F59E0B] hover:shadow-md transition-all text-sm text-[#4A4A4A] dark:text-[#D1D1D1]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <LoadingMessage />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 lg:px-8 pb-2">
            <div className="max-w-4xl mx-auto bg-[#FEE2E2] dark:bg-[#2D1616] border border-[#FCA5A5] dark:border-[#991B1B] text-[#DC2626] dark:text-[#FCA5A5] px-4 py-3 rounded-2xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[#E5E7EB] dark:border-[#333333] bg-white dark:bg-[#121212] px-4 py-4 lg:px-8 lg:py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F9FAFB] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-3xl p-4 flex items-end gap-3 focus-within:border-[#F47B20] dark:focus-within:border-[#F59E0B] transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about safety procedures, PPE, regulations..."
                className="flex-1 bg-transparent text-[#1E1E1E] dark:text-white placeholder-[#A8ADB4] dark:placeholder-[#70757F] text-sm resize-none outline-none min-h-[24px] max-h-[120px]"
                rows="1"
                style={{ lineHeight: "1.5" }}
              />
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#F47B20] to-[#FF8C42] dark:from-[#D97706] dark:to-[#F59E0B] rounded-2xl flex items-center justify-center text-white hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-[#A8ADB4] dark:text-[#70757F] text-center mt-3">
              AI-generated responses. Always verify critical safety information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
