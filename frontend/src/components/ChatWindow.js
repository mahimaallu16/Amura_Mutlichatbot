import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import "./ChatWindow.css";

export default function ChatWindow({ onSend }) {
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const handleSend = async (input, type) => {
    setMessages((msgs) => [...msgs, { role: "user", text: input, type }]);
    const response = await onSend(input);
    setMessages((msgs) => [...msgs, { role: "user", text: input, type }, { role: "bot", text: response, type }]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
