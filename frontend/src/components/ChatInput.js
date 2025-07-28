import React, { useState, useRef, useEffect } from "react";
import './ChatInput.css';

export default function ChatInput({ onSend, onFileUpload, disabled, placeholder = "Type your message..." }) {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-grow textarea with better limits
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // Max height in pixels
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
      
      // Show scrollbar if content exceeds max height
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  // Auto-focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      setSelectedFiles([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Re-focus after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      // Clear input on Escape
      setInput("");
      setSelectedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Filter for PDF files only for PDF bot
      const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...pdfFiles]);
        if (onFileUpload) onFileUpload(pdfFiles);
      }
    }
    // Reset file input
    e.target.value = '';
  };

  const handlePaste = (e) => {
    // Handle pasted files
    const items = e.clipboardData?.items;
    if (items) {
      const pastedFiles = [];
      for (let item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
            pastedFiles.push(file);
          }
        }
      }
      if (pastedFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...pastedFiles]);
        if (onFileUpload) onFileUpload(pastedFiles);
      }
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    if (onFileUpload) onFileUpload([]);
  };

  const isSendDisabled = disabled || !input.trim();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="chatgpt-input-bar">
      <div className={`chatgpt-input-box ${isFocused ? 'focused' : ''}`}>
        <button
          className="chatgpt-upload-btn"
          title="Attach PDF files"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={disabled}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.49"/>
          </svg>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={disabled}
            accept=".pdf"
          />
        </button>
        <textarea
          ref={textareaRef}
          className="chatgpt-textarea"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          rows={1}
          disabled={disabled}
          maxLength={4000}
        />
        <button 
          className={`chatgpt-send-btn ${isSendDisabled ? 'disabled' : ''}`} 
          onClick={handleSend} 
          title="Send message" 
          disabled={isSendDisabled}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      {/* Multiple Files Display */}
      {selectedFiles.length > 0 && (
        <div className="chatgpt-input-files-info">
          <div className="files-header">
            <span className="files-count">{selectedFiles.length} PDF file(s) selected</span>
            {selectedFiles.length > 1 && (
              <button className="remove-all-files-btn" onClick={removeAllFiles} title="Remove all files">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Clear All
              </button>
            )}
          </div>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
                <button className="remove-file-btn" onClick={() => removeFile(index)} title="Remove file">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="chatgpt-input-hint">
        <span>Press <b>Enter</b> to send, <b>Shift+Enter</b> for new line</span>
        {input.length > 0 && (
          <span className="char-count">{input.length}/4000</span>
        )}
      </div>
    </div>
  );
} 