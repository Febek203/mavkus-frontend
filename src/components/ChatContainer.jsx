import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Background from "./Background";

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef();

  // Scroll automatico
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Invio messaggio
  const sendMessage = async (content) => {
    if (!content) return;

    const userMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("https://mavkus-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      const botMessage = { role: "bot", content: data.reply || "Errore, riprova." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Errore di connessione." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 text-white overflow-hidden flex flex-col">
      <Background />
      <div className="relative z-10 flex-1 p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="text-gray-400 ml-2 animate-pulse">Il bot sta scrivendo...</div>
        )}
        <div ref={chatEndRef}></div>
      </div>
      <div className="relative z-10 p-4 border-t border-gray-700">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
