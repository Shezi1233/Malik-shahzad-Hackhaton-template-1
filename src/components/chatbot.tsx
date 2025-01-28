"use client";
import { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Function to handle responses from the bot (mock response for now)
  const getBotResponse = (userQuery: string) => {
    // Simple mock function to simulate different responses based on input
    if (userQuery.toLowerCase().includes("hello")) {
      return "Hello! How can I help you today?";
    } else if (userQuery.toLowerCase().includes("your name")) {
      return "I am your friendly chatbot!";
    } else if (userQuery.toLowerCase().includes("bye")) {
      return "Goodbye! Have a great day!";
    }
    return "Sorry, I don't understand that. Can you ask something else?";
  };

  // Function to send user message
  const handleSendMessage = () => {
    if (userMessage.trim() === "") return;

    // Add the user's message to the chat
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setUserMessage("");
    setIsTyping(true);

    // Get bot response after a brief delay
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage); // Get bot response based on user query
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botResponse },
      ]);
      setIsTyping(false);
    }, 1500); // Simulate typing time
  };

  return (
    <>
      {/* Chatbot Icon (Floating Button) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-black text-white rounded-full p-3 text-xl shadow-lg hover:bg-gray-300"
      >
        💬
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
          <div className="flex justify-between items-center bg-black text-white p-3 rounded-t-lg">
            <span>Chat with us</span>
            <button onClick={() => setIsOpen(false)} className="text-2xl font-semibold">
              &times;
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {/* Render messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`${
                    msg.sender === "user" ? "bg-black text-white" : "bg-gray-200 text-gray-800"
                  } p-2 rounded-lg max-w-xs`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="text-gray-500 text-sm">Typing...</div>
              </div>
            )}
          </div>

          <div className="flex p-3 bg-gray-100 rounded-b-lg">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            />
            <button onClick={handleSendMessage} className="ml-2 bg-black text-white p-2 rounded-lg">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
