import React, { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import ChatInput from "../components/ChatInput";
import CircularProgress from '@mui/material/CircularProgress';
import ChatMessage from "../components/ChatMessage";
import { connectSocket, disconnectSocket, sendMessage, onStreamResponse, offStreamResponse } from "../services/api";
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
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  TableChart as TableChartIcon,
  Info as InfoIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  Analytics as AnalyticsIcon,
  Functions as FunctionsIcon,
  Brush as BrushIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  DataObject as DataIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Calculate as CalculateIcon,
  Code as CodeIcon
} from '@mui/icons-material';

export default function ExcelBot({ mode, setMode }) {
  const [selectedSegment, setSelectedSegment] = useState(3);
  const [messages, setMessages] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [availableSheets, setAvailableSheets] = useState([]);
  const [dataSummary, setDataSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [formulaQuery, setFormulaQuery] = useState('');
  const [cleaningOperations, setCleaningOperations] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
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
    return () => {
      offStreamResponse();
      disconnectSocket();
    };
  }, []);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const file = files[0];
      setExcelFile(file);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to get file info
      const response = await fetch('/api/excel/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setFileInfo(data);
        setAvailableSheets(data.sheets || []);
        setSelectedSheet(data.sheets?.[0] || '');
        setDataSummary(data.summary);
        
        // Add success message
        const successMessage = {
          id: Date.now() + Math.random(),
          role: 'bot',
          text: `✅ Successfully uploaded Excel file: ${file.name}
          
📊 **File Information:**
• Sheets: ${data.total_sheets}
• Available sheets: ${data.sheets?.join(', ') || 'N/A'}

You can now ask questions about your data, generate formulas, create charts, clean data, and more!`,
          botType: 'excel',
          isStreaming: false
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload file');
      }
    } catch (error) {
      setError('Network error during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (input) => {
    if (!input.trim() || !excelFile) return;
    
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: input,
      botType: 'excel'
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      await sendMessage('excel', input, excelFile);
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleFormulaGeneration = async () => {
    if (!formulaQuery.trim()) return;
    
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: `Generate formula: ${formulaQuery}`,
      botType: 'excel'
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      await sendMessage('excel', `Generate formula for: ${formulaQuery}`, excelFile);
    } catch (error) {
      setError('Failed to generate formula');
    } finally {
      setLoading(false);
    }
  };

  const handleDataCleaning = async () => {
    if (cleaningOperations.length === 0) return;
    
    const operationsText = cleaningOperations.join(', ');
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: `Clean data: ${operationsText}`,
      botType: 'excel'
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      await sendMessage('excel', `Perform data cleaning: ${operationsText}`, excelFile);
    } catch (error) {
      setError('Failed to clean data');
    } finally {
      setLoading(false);
    }
  };

  const handleChartCreation = async (chartType, xColumn, yColumn) => {
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: `Create ${chartType} chart with ${xColumn} on x-axis and ${yColumn} on y-axis`,
      botType: 'excel'
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      await sendMessage('excel', `Create ${chartType} chart: x=${xColumn}, y=${yColumn}`, excelFile);
    } catch (error) {
      setError('Failed to create chart');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'user',
      text: `Export data as ${exportFormat}`,
      botType: 'excel'
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      await sendMessage('excel', `Export data in ${exportFormat} format`, excelFile);
    } catch (error) {
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setExcelFile(null);
    setFileInfo(null);
    setAvailableSheets([]);
    setSelectedSheet('');
    setDataSummary(null);
    setMessages([]);
    setError(null);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderedMessages = useMemo(() => (
    !excelFile ? (
      <div className="chat-empty">
        <TableChartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Upload Excel File
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Upload an Excel file (.xlsx, .xls, .csv) to start analyzing your data.
          <br />
          The AI will help you query, visualize, clean, and export your data.
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ mt: 2 }}
        >
          Upload Excel File
        </Button>
      </div>
    ) : messages.length === 0 ? (
      <div className="chat-empty">
        <TableChartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Ready to Analyze!
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Your Excel file is loaded and ready for analysis.
          <br />
          Ask questions, generate formulas, create charts, or clean your data!
        </Typography>
      </div>
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
  ), [messages, excelFile]);

  const renderAdvancedFeatures = () => (
    <Paper elevation={1} sx={{ m: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Advanced Excel Features
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
            <Tab label="Query" icon={<DataIcon />} />
            <Tab label="Formulas" icon={<FunctionsIcon />} />
            <Tab label="Charts" icon={<BarChartIcon />} />
            <Tab label="Clean" icon={<BrushIcon />} />
            <Tab label="Export" icon={<DownloadIcon />} />
          </Tabs>

          <Box mt={2}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Data Querying</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Ask questions about your data in natural language:
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label="What is the total revenue?" variant="outlined" />
                  <Chip label="Show me the top 5 products" variant="outlined" />
                  <Chip label="What's the average profit by region?" variant="outlined" />
                  <Chip label="Filter sales > 1000" variant="outlined" />
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Formula Generation</Typography>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., Write a formula to calculate profit margin"
                    value={formulaQuery}
                    onChange={(e) => setFormulaQuery(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleFormulaGeneration}>
                    Generate
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label="SUMIF formula for East region" variant="outlined" />
                  <Chip label="VLOOKUP to find product prices" variant="outlined" />
                  <Chip label="IF formula for conditional logic" variant="outlined" />
                </Box>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Chart Creation</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">Bar Chart</Typography>
                        <Button
                          size="small"
                          startIcon={<BarChartIcon />}
                          onClick={() => handleChartCreation('bar', 'Product', 'Sales')}
                        >
                          Create Bar Chart
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">Line Chart</Typography>
                        <Button
                          size="small"
                          startIcon={<LineChartIcon />}
                          onClick={() => handleChartCreation('line', 'Date', 'Revenue')}
                        >
                          Create Line Chart
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">Pie Chart</Typography>
                        <Button
                          size="small"
                          startIcon={<PieChartIcon />}
                          onClick={() => handleChartCreation('pie', 'Category', 'Sales')}
                        >
                          Create Pie Chart
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">Scatter Plot</Typography>
                        <Button
                          size="small"
                          startIcon={<ScatterPlotIcon />}
                          onClick={() => handleChartCreation('scatter', 'Price', 'Sales')}
                        >
                          Create Scatter Plot
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Data Cleaning</Typography>
                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => setCleaningOperations(prev => [...prev, 'remove duplicates'])}
                  >
                    Remove Duplicates
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => setCleaningOperations(prev => [...prev, 'fill missing values'])}
                  >
                    Fill Missing Values
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => setCleaningOperations(prev => [...prev, 'remove null values'])}
                  >
                    Remove Null Values
                  </Button>
                </Box>
                {cleaningOperations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Selected Operations:</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {cleaningOperations.map((op, index) => (
                        <Chip
                          key={index}
                          label={op}
                          onDelete={() => setCleaningOperations(prev => prev.filter((_, i) => i !== index))}
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleDataCleaning}
                      sx={{ mt: 1 }}
                    >
                      Clean Data
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Export Data</Typography>
                <Box display="flex" gap={1} alignItems="center" mb={2}>
                  <FormControl size="small">
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      label="Format"
                    >
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDataExport}
                  >
                    Export
                  </Button>
                </Box>
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
        {excelFile && (
          <Paper elevation={1} sx={{ m: 2, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Excel File: {excelFile.name}
              </Typography>
              <Box>
                <Tooltip title="File Information">
                  <IconButton onClick={() => setFileInfo(fileInfo)} size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove File">
                  <IconButton onClick={removeFile} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {fileInfo && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sheets: {fileInfo.total_sheets} • Selected: {selectedSheet}
                </Typography>
                {dataSummary && (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {Object.entries(dataSummary).map(([sheet, info]) => (
                      <Chip
                        key={sheet}
                        label={`${sheet}: ${info.rows}×${info.columns}`}
                        variant={selectedSheet === sheet ? "filled" : "outlined"}
                        onClick={() => setSelectedSheet(sheet)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Advanced Features Section */}
        {excelFile && renderAdvancedFeatures()}
        
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
                  Analyzing Excel data and generating response...
                </Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div style={{ position: 'sticky', bottom: 0, background: 'transparent', zIndex: 10 }}>
            <ChatInput 
              onSend={handleSend} 
              onFileUpload={handleFileUpload} 
              disabled={!excelFile || loading}
              placeholder="Ask questions about your Excel data, generate formulas, create charts..."
            />
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => handleFileUpload(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );
}
