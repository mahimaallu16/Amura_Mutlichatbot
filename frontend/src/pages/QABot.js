import React, { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import ChatInput from "../components/ChatInput";
import CircularProgress from '@mui/material/CircularProgress';
import ChatMessage from "../components/ChatMessage";
import { connectSocket, disconnectSocket, sendMessage, onStreamResponse, offStreamResponse } from "../services/api";

export default function QABot({ mode, setMode }) {
  const [selectedSegment, setSelectedSegment] = useState(2);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    connectSocket();
    onStreamResponse((data) => {
      // Only handle bot messages, user messages are already added in handleSend
      if (data.role === 'bot') {
        setMessages(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === 'bot') {
            lastMessage.text = data.content;
            lastMessage.isStreaming = !data.is_complete;
          } else {
            const newMessage = {
              id: Date.now() + Math.random(),
              role: data.role,
              text: data.content,
              botType: data.bot_type,
              isStreaming: !data.is_complete
            };
            updated.push(newMessage);
          }
          return updated;
        });
      }
    });
    return () => {
      offStreamResponse();
      disconnectSocket();
    };
  }, []);

  const handleSend = async (input) => {
    if (!input.trim() || loading) return;
    
    // Add user message immediately to the chat
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: input,
      botType: 'qa'
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    await sendMessage('qa', input, selectedFile);
    setSelectedFile(null);
    setLoading(false);
  };

  const handleFileUpload = (file) => {
    setSelectedFile(file);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderedMessages = useMemo(() => (
    messages.length === 0 ? (
      <div className="chat-empty">Start a conversation with the QA bot!</div>
    ) : (
      messages.map((msg) => (
        <ChatMessage 
          key={msg.id} 
          role={msg.role} 
          text={msg.text} 
          isStreaming={msg.isStreaming}
        />
      ))
    )
  ), [messages]);

  return (
    <div className="app-layout">
      <Sidebar selectedSegment={selectedSegment} onSegmentSelect={setSelectedSegment} mode={mode} setMode={setMode} />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopNavBar selectedSegment={selectedSegment} onSegmentSelect={setSelectedSegment} mode={mode} setMode={setMode} />
        <div className="chat-window" style={{ flex: 1, position: 'relative' }}>
          {selectedFile && (
            <div className="chatgpt-input-file-info" style={{ marginBottom: 8 }}>
              <span>Selected file: {selectedFile.name}</span>
            </div>
          )}
          <div className="chat-messages">
            {renderedMessages}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <CircularProgress size={32} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ position: 'sticky', bottom: 0, background: 'transparent', zIndex: 10 }}>
            <ChatInput 
              onSend={handleSend} 
              onFileUpload={handleFileUpload} 
              disabled={loading}
              placeholder="Ask me anything! I'm here to help with your questions..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
