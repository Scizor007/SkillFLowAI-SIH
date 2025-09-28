import { useState } from "react";
import { useTheme } from "next-themes";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure you have utils for styling
import { useChatbot } from "@/context/ChatbotContext";

const Chatbot = () => {
  const { theme } = useTheme();
  const { messages, sendMessage } = useChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div
          className={cn(
            "w-80 p-4 border rounded-lg shadow-lg transition-all",
            theme === "dark"
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-white text-black border-gray-200"
          )}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Career Chatbot</h3>
            <button className="hover:text-red-500 transition-all" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-60 overflow-y-auto mt-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <strong className="font-semibold">{msg.role === "user" ? "You:" : "Bot:"}</strong>{" "}
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className={cn(
                "w-full p-2 border rounded outline-none",
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-gray-100 text-black border-gray-300"
              )}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers..."
            />
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-all"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
