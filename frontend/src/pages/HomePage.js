import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import ChatInput from "../components/ChatInput";
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import TableChartIcon from '@mui/icons-material/TableChart';
import BookIcon from '@mui/icons-material/Book';
import BotCard from "../components/BotCard";
import ChatMessage from "../components/ChatMessage";
import { connectSocket, disconnectSocket, sendMessage, onMessageReceived, onStreamResponse, offMessageReceived, offStreamResponse } from "../services/api";
import "./HomePage.css";

const botCards = [
  {
    icon: <ChatIcon fontSize="large" color="primary" />, title: "General bot", desc: "Start a general conversation", path: "/"
  },
  {
    icon: <DescriptionIcon fontSize="large" color="primary" />, title: "PDF bot", desc: "Chat with PDF documents", path: "/pdf"
  },
  {
    icon: <QuizIcon fontSize="large" color="primary" />, title: "QA bot", desc: "Ask questions and get answers", path: "/qa"
  },
  {
    icon: <TableChartIcon fontSize="large" color="primary" />, title: "Excel bot", desc: "Analyze Excel files", path: "/excel"
  },
  {
    icon: <BookIcon fontSize="large" color="primary" />, title: "Notebook Bot", desc: "Work with Jupyter Notebooks", path: "/notebook"
  },
];

export default function HomePage({ mode, setMode }) {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    connectSocket();
    
    onMessageReceived((data) => {
      // Only add bot messages, user messages are already added in handleSend
      if (data.role === 'bot') {
        const newMessage = {
          id: Date.now() + Math.random(),
          role: data.role,
          text: data.content,
          botType: data.bot_type
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    onStreamResponse((data) => {
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
    });

    return () => {
      offMessageReceived();
      offStreamResponse();
      disconnectSocket();
    };
  }, []);

  const handleSend = async (input) => {
    if (!input.trim()) return;
    
    // Add user message immediately to the chat
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: input,
      botType: 'general'
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send message via WebSocket for real-time response
    await sendMessage('general', input, selectedFile);
    setSelectedFile(null);
  };

  const handleFileUpload = (file) => {
    setSelectedFile(file);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderedMessages = useMemo(() => (
    messages.length === 0 ? (
      <div className="chat-empty">Start a conversation with the General bot!</div>
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
      <div className="main-content column-layout">
        <TopNavBar selectedSegment={selectedSegment} onSegmentSelect={setSelectedSegment} mode={mode} setMode={setMode} />
        <div className="home-welcome premium-welcome">
          <Typography variant="h4" fontWeight={700} gutterBottom>How can I help you today?</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Select a bot or start typing to begin your conversation.
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            {botCards.map((card) => (
              <Grid item key={card.title} xs={12} sm={6} md={4} lg={3}>
                <BotCard icon={card.icon} title={card.title} desc={card.desc} onClick={() => navigate(card.path)} />
              </Grid>
            ))}
          </Grid>
        </div>
        <div className="chat-window premium-chat-window">
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
          <div className="chat-input-float">
            <ChatInput 
              onSend={handleSend} 
              onFileUpload={handleFileUpload} 
              disabled={loading}
              placeholder="Start a conversation with me..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
