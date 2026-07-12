"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

const quickQueries = [
  "Show me products",
  "What's new?",
  "Any discounts?",
  "Recommend something",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "👋 Hi! Welcome to **SHOP.CO**! I'm your AI shopping assistant.\n\nAsk me about products, prices, sizes, or just say **Hello**!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const data = await api.post<{ reply: string }>(
        "/chatbot",
        { message: userMsg },
        false
      );
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "😔 Sorry, I'm having trouble connecting. Please try again!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-black text-white rounded-full p-4 shadow-xl hover:bg-gray-800 transition-all z-50 hover:scale-105 active:scale-95"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden max-h-[600px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-black to-gray-800 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛍️</span>
                <div>
                  <p className="font-bold text-sm leading-tight">SHOP.CO Assistant</p>
                  <p className="text-[10px] text-green-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3 min-h-[300px] max-h-[400px]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-black text-white rounded-2xl rounded-br-md"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Queries */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickQueries.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask about products..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="bg-black text-white p-2.5 rounded-full hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex-shrink-0"
                >
                  {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
