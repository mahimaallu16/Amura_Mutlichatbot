import React, { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import ChatInput from "../components/ChatInput";
import CircularProgress from '@mui/material/CircularProgress';
import ChatMessage from "../components/ChatMessage";
import { connectSocket, disconnectSocket, onStreamResponse, offStreamResponse } from "../services/api";
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  Analytics as AnalyticsIcon,
  Translate as TranslateIcon,
  Compare as CompareIcon,
  Search as SearchIcon,
  Summarize as SummarizeIcon,
  Mic as MicIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

export default function PDFBot({ mode, setMode }) {
  const [selectedSegment, setSelectedSegment] = useState(1);
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [selectedFilesForComparison] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [translationResult, setTranslationResult] = useState(null);
  const [extractedContent, setExtractedContent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [summaryType, setSummaryType] = useState('executive');
  const [summaries, setSummaries] = useState([]);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    connectSocket();
    onStreamResponse((data) => {
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
    
    // Load collection stats on mount
    loadStats();
    
    return () => {
      offStreamResponse();
      disconnectSocket();
    };
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/pdf/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSend = async (input) => {
    if (!input.trim() || uploadedFiles.length === 0) return;
    
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: input,
      botType: 'pdf'
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('question', input);
      
      // Add all uploaded files
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/chat/pdf', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const botMessage = {
          id: Date.now() + Math.random(),
          role: 'bot',
          text: data.response,
          botType: 'pdf',
          sources: data.sources,
          confidence: data.confidence,
          additionalData: data.additional_data,
          isStreaming: false
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to get response');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
    setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add files to uploaded files list
        const newFiles = Array.from(files).map(file => ({
          file: file,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }));
        
        setUploadedFiles(prev => [...prev, ...newFiles]);
        
        // Show success message with advanced features info
        const successMessage = {
          id: Date.now() + Math.random(),
          role: 'bot',
          text: `✅ Successfully uploaded ${data.files_processed} PDF file(s) with advanced extraction:
• ${data.total_pages} total pages
• ${data.tables_found} tables found
• ${data.images_found} images found
• ${data.forms_found} form fields found
• ${data.annotations_found} annotations found

You can now ask questions about these documents, including table queries, form extraction, and more!`,
          botType: 'pdf',
          isStreaming: false
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Reload stats
        loadStats();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload files');
      }
    } catch (error) {
      setError('Network error during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
    // Reset input
    event.target.value = '';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = async () => {
    try {
      const response = await fetch('/api/pdf/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        setUploadedFiles([]);
        setMessages([]);
        loadStats();
        
        const clearMessage = {
          id: Date.now() + Math.random(),
          role: 'bot',
          text: '🗑️ All documents have been cleared from the system.',
          botType: 'pdf',
          isStreaming: false
        };
        setMessages(prev => [...prev, clearMessage]);
      }
    } catch (error) {
      setError('Failed to clear documents');
    }
  };

  const getFileInfo = async (file) => {
    setSelectedFileInfo({
      name: file.name,
      size: file.size,
      uploadedAt: file.uploadedAt,
      type: 'PDF Document'
    });
    setShowFileInfo(true);
  };

  // Advanced Features Functions
  const handleDocumentComparison = async () => {
    if (selectedFilesForComparison.length !== 2) {
      setError('Please select exactly 2 files for comparison');
      return;
    }

    try {
      const response = await fetch('/api/pdf/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_hash1: selectedFilesForComparison[0],
          file_hash2: selectedFilesForComparison[1]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to compare documents');
      }
    } catch (error) {
      setError('Network error during comparison');
    }
  };

  const handleTranslation = async (fileHash, targetLanguage = 'es') => {
    try {
      const response = await fetch(`/api/pdf/translate/${fileHash}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_language: targetLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTranslationResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to translate document');
      }
    } catch (error) {
      setError('Network error during translation');
    }
  };

  const handleContentExtraction = async (fileHash, query) => {
    try {
      const response = await fetch(`/api/pdf/extract/${fileHash}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedContent(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to extract content');
      }
    } catch (error) {
      setError('Network error during content extraction');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch('/api/pdf/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to search documents');
      }
    } catch (error) {
      setError('Network error during search');
    }
  };

  const handleSummarize = async () => {
    if (uploadedFiles.length === 0) {
      setError('No documents to summarize');
      return;
    }

    try {
      const response = await fetch('/api/pdf/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_hashes: uploadedFiles.map(f => f.file_hash || 'placeholder'),
          summary_type: summaryType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummaries(data.summaries);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate summaries');
      }
    } catch (error) {
      setError('Network error during summarization');
    }
  };

  const handleVoiceQuery = async () => {
    if (!voiceQuery.trim()) return;

    try {
      const response = await fetch('/api/pdf/voice/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio: voiceQuery // This would be actual audio data
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Handle voice query response
        console.log('Voice query response:', data);
      }
    } catch (error) {
      setError('Network error during voice query');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderedMessages = useMemo(() => (
    uploadedFiles.length === 0 ? (
      <div className="chat-empty">
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Upload PDF Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Upload one or more PDF files to start chatting with your documents.
          <br />
          The AI will analyze and understand the content to answer your questions.
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleFileSelect}
          sx={{ mt: 2 }}
        >
          Upload PDF Files
        </Button>
      </div>
    ) : messages.length === 0 ? (
      <div className="chat-empty">
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Ready to Chat!
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          You have {uploadedFiles.length} document(s) uploaded.
          <br />
          Start asking questions about your PDF content!
        </Typography>
      </div>
    ) : (
      messages.map((msg) => (
        <ChatMessage 
          key={msg.id} 
          role={msg.role} 
          text={msg.text} 
          isStreaming={msg.isStreaming}
          sources={msg.sources}
          confidence={msg.confidence}
          additionalData={msg.additionalData}
        />
      ))
    )
  ), [messages, uploadedFiles]);

  const renderAdvancedFeatures = () => (
    <Paper elevation={1} sx={{ m: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Advanced Features
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
        >
          {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
        </Button>
      </Box>

      {showAdvancedFeatures && (
        <>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Search" icon={<SearchIcon />} />
            <Tab label="Compare" icon={<CompareIcon />} />
            <Tab label="Translate" icon={<TranslateIcon />} />
            <Tab label="Summarize" icon={<SummarizeIcon />} />
            <Tab label="Voice" icon={<MicIcon />} />
          </Tabs>

          <Box mt={2}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Search Documents</Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleSearch}>
                    Search
                  </Button>
                </Box>
                {searchResults && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Search Results:</Typography>
                    <Typography variant="body2">{searchResults.response}</Typography>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Compare Documents</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Select 2 files to compare
                </Typography>
                <Button variant="contained" onClick={handleDocumentComparison}>
                  Compare Selected Files
                </Button>
                {comparisonResult && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Comparison Results:</Typography>
                    <Typography variant="body2">
                      Similarity Score: {comparisonResult.similarity_score}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Translate Documents</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Target Language</InputLabel>
                  <Select value="es" label="Target Language">
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="it">Italian</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={() => handleTranslation('file_hash', 'es')}>
                  Translate
                </Button>
                {translationResult && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Translation:</Typography>
                    <Typography variant="body2">{translationResult.translated_text}</Typography>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Generate Summaries</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Summary Type</InputLabel>
                  <Select value={summaryType} onChange={(e) => setSummaryType(e.target.value)} label="Summary Type">
                    <MenuItem value="executive">Executive Summary</MenuItem>
                    <MenuItem value="bullet">Bullet Points</MenuItem>
                    <MenuItem value="section">Section Summary</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleSummarize}>
                  Generate Summaries
                </Button>
                {summaries.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Summaries:</Typography>
                    {summaries.map((summary, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{summary.file_name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2">{summary.summary}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Voice Queries</Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Voice query text..."
                    value={voiceQuery}
                    onChange={(e) => setVoiceQuery(e.target.value)}
                  />
                  <IconButton 
                    color={isRecording ? 'error' : 'primary'}
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <MicIcon />
                  </IconButton>
                </Box>
                <Button variant="contained" onClick={handleVoiceQuery} sx={{ mt: 1 }}>
                  Send Voice Query
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
    </Paper>
  );

  return (
    <div className="app-layout">
      <Sidebar selectedSegment={selectedSegment} onSegmentSelect={setSelectedSegment} mode={mode} setMode={setMode} />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopNavBar selectedSegment={selectedSegment} onSegmentSelect={setSelectedSegment} mode={mode} setMode={setMode} />
        
        {/* File Management Section */}
        {uploadedFiles.length > 0 && (
          <Paper elevation={1} sx={{ m: 2, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Uploaded Documents ({uploadedFiles.length})
              </Typography>
              <Box>
                <Tooltip title="View Statistics">
                  <IconButton onClick={() => setShowStats(true)} size="small">
                    <AnalyticsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear All Documents">
                  <IconButton onClick={clearAllFiles} size="small" color="error">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <List dense>
              {uploadedFiles.map((file, index) => (
                <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded ${new Date(file.uploadedAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="File Information">
                      <IconButton onClick={() => getFileInfo(file)} size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove File">
                      <IconButton onClick={() => removeFile(index)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={handleFileSelect}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add More Files'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Advanced Features Section */}
        {uploadedFiles.length > 0 && renderAdvancedFeatures()}
        
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Chat Window */}
        <div className="chat-window" style={{ flex: 1, position: 'relative' }}>
          <div className="chat-messages">
            {renderedMessages}
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Analyzing documents and generating response...
                </Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div style={{ position: 'sticky', bottom: 0, background: 'transparent', zIndex: 10 }}>
            <ChatInput 
              onSend={handleSend} 
              onFileUpload={handleFileUpload} 
              disabled={uploadedFiles.length === 0 || loading}
              placeholder="Ask questions about your PDF documents..."
            />
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      {/* Statistics Dialog */}
      <Dialog open={showStats} onClose={() => setShowStats(false)} maxWidth="md" fullWidth>
        <DialogTitle>Document Collection Statistics</DialogTitle>
        <DialogContent>
          {stats ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Basic Stats</Typography>
                    <Typography>Total Documents: {stats.total_documents || 0}</Typography>
                    <Typography>Unique Files: {stats.unique_files || 0}</Typography>
                    <Typography>Total Chunks: {stats.estimated_total_chunks || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Advanced Stats</Typography>
                    <Typography>Tables Found: {stats.total_tables || 0}</Typography>
                    <Typography>Images Found: {stats.total_images || 0}</Typography>
                    <Typography>Forms Found: {stats.total_forms || 0}</Typography>
                    <Typography>Annotations: {stats.total_annotations || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>Loading statistics...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStats(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* File Info Dialog */}
      <Dialog open={showFileInfo} onClose={() => setShowFileInfo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>File Information</DialogTitle>
        <DialogContent>
          {selectedFileInfo && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {selectedFileInfo.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Size:</strong> {(selectedFileInfo.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {selectedFileInfo.type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Uploaded:</strong> {new Date(selectedFileInfo.uploadedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileInfo(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
