import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  IconButton, 
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Source as SourceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  TableChart as TableIcon,
  Input as InputIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  CalendarToday as DateIcon,
  DataObject as DataIcon,
  SmartToy as BotIcon,
  Person as UserIcon
} from '@mui/icons-material';

const ChatMessage = ({ role, text, isStreaming, sources, confidence, additionalData }) => {
  const [expanded, setExpanded] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'high':
        return <TrendingUpIcon color="success" fontSize="small" />;
      case 'medium':
        return <RemoveIcon color="warning" fontSize="small" />;
      case 'low':
        return <TrendingDownIcon color="error" fontSize="small" />;
      default:
        return <RemoveIcon color="disabled" fontSize="small" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderTableData = (tableData) => {
    if (!tableData || !Array.isArray(tableData)) return null;

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 600 }}>
          <TableIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
          Table Analysis Results
        </Typography>
        {tableData.map((result, index) => (
          <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {result.table} - Column: {result.column}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              Total: {typeof result.total === 'number' ? result.total.toLocaleString() : result.total}
            </Typography>
            {result.data && result.data.length > 0 && (
              <TableContainer sx={{ mt: 1, maxHeight: 200, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      {Object.keys(result.data[0]).map((key) => (
                        <TableCell key={key} sx={{ fontWeight: 600 }}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.data.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        ))}
      </Box>
    );
  };

  const renderFormData = (formData) => {
    if (!formData || !Array.isArray(formData)) return null;

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 600 }}>
          <InputIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
          Form Fields Found
        </Typography>
        <List dense sx={{ p: 0 }}>
          {formData.slice(0, 10).map((form, index) => (
            <ListItem key={index} sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              mb: 1,
              backgroundColor: 'grey.50'
            }}>
              <ListItemText
                primary={form.field_name}
                secondary={`Type: ${form.field_type} | Value: ${form.field_value || 'Empty'} | Page: ${form.page}`}
              />
            </ListItem>
          ))}
        </List>
        {formData.length > 10 && (
          <Typography variant="caption" color="text.secondary">
            ... and {formData.length - 10} more form fields
          </Typography>
        )}
      </Box>
    );
  };

  const renderEntityData = (entities) => {
    if (!entities) return null;

    const entityTypes = [
      { key: 'persons', icon: <PersonIcon />, label: 'People', color: 'primary' },
      { key: 'organizations', icon: <BusinessIcon />, label: 'Organizations', color: 'secondary' },
      { key: 'locations', icon: <LocationIcon />, label: 'Locations', color: 'success' },
      { key: 'dates', icon: <DateIcon />, label: 'Dates', color: 'info' },
      { key: 'money', icon: <MoneyIcon />, label: 'Monetary Amounts', color: 'warning' },
      { key: 'percentages', icon: <PercentIcon />, label: 'Percentages', color: 'error' }
    ];

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 600 }}>
          <DataIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
          Named Entities Found
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {entityTypes.map(({ key, icon, label, color }) => {
            const values = entities[key];
            if (!values || values.length === 0) return null;

            return (
              <Accordion key={key} sx={{ minWidth: 200, flex: 1, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ color: color + '.main', mr: 1 }}>{icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{label} ({values.length})</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {values.slice(0, 10).map((value, index) => (
                      <Chip
                        key={index}
                        label={value}
                        size="small"
                        color={color}
                        variant="outlined"
                      />
                    ))}
                    {values.length > 10 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {values.length - 10} more
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderAdditionalData = () => {
    if (!additionalData) return null;

  return (
      <Box mt={2}>
        {additionalData.table_data && renderTableData(additionalData.table_data)}
        {additionalData.form_data && renderFormData(additionalData.form_data)}
        {additionalData.entities && renderEntityData(additionalData.entities)}
        
        {/* Generic data display for other types */}
        {additionalData.matching_tables && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 600 }}>
              <TableIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
              Matching Tables
            </Typography>
            <Typography variant="body2">
              Found {additionalData.matching_tables.length} tables matching your query.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderSources = () => {
    if (!sources || sources.length === 0) return null;

    return (
      <Box mt={2} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Tooltip title="Toggle sources">
            <IconButton
              size="small"
              onClick={() => setShowSources(!showSources)}
              sx={{ p: 0.5 }}
            >
              <SourceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Sources ({sources.length})
          </Typography>
        </Box>
        
        <Collapse in={showSources}>
          <Box mt={1}>
            {sources.map((source, index) => (
              <Paper key={index} elevation={0} sx={{ 
                p: 1.5, 
                mb: 1, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                backgroundColor: 'grey.50'
              }}>
                <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {source.file_name}
                </Typography>
                {source.chunk_index && (
                  <Typography variant="caption" component="div" color="text.secondary">
                    Chunk: {source.chunk_index}
                  </Typography>
                )}
                {source.relevance_score && (
                  <Typography variant="caption" component="div" color="text.secondary">
                    Relevance: {(source.relevance_score * 100).toFixed(1)}%
                  </Typography>
                )}
                {source.type && (
                  <Chip
                    label={source.type}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Paper>
            ))}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
        mb: 3,
        px: 3,
        py: 1
      }}
    >
      <Box
        sx={{
          display: 'flex',
          maxWidth: '80%',
          minWidth: '300px',
          gap: 2
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: role === 'user' ? 'primary.main' : 'grey.700',
            mt: 0.5
          }}
        >
          {role === 'user' ? <UserIcon fontSize="small" /> : <BotIcon fontSize="small" />}
        </Avatar>

        {/* Message Content */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: role === 'user' ? 'primary.main' : 'grey.100',
            color: role === 'user' ? 'white' : 'text.primary',
            borderRadius: 3,
            p: 2.5,
            boxShadow: role === 'user' ? 2 : 0,
            border: role === 'user' ? 'none' : '1px solid',
            borderColor: 'divider',
            position: 'relative',
            '&::before': role === 'user' ? {
              content: '""',
              position: 'absolute',
              right: -8,
              top: 12,
              width: 0,
              height: 0,
              borderLeft: '8px solid',
              borderLeftColor: 'primary.main',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent'
            } : {
              content: '""',
              position: 'absolute',
              left: -8,
              top: 12,
              width: 0,
              height: 0,
              borderRight: '8px solid',
              borderRightColor: 'grey.100',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent'
            }
          }}
        >
          {/* Message text */}
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              opacity: isStreaming ? 0.7 : 1,
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}
          >
            {text}
            {isStreaming && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1.2em',
                  backgroundColor: 'currentColor',
                  animation: 'blink 1s infinite',
                  ml: 0.5,
                  '@keyframes blink': {
                    '0%, 50%': { opacity: 1 },
                    '51%, 100%': { opacity: 0 }
                  }
                }}
              />
            )}
          </Typography>

          {/* Confidence indicator for bot messages */}
          {role === 'bot' && confidence && (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              {getConfidenceIcon(confidence)}
              <Chip
                label={`Confidence: ${confidence}`}
                size="small"
                color={getConfidenceColor(confidence)}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          )}

          {/* Additional data display */}
          {role === 'bot' && renderAdditionalData()}

          {/* Sources */}
          {role === 'bot' && renderSources()}

          {/* Expand/collapse button for long messages */}
          {text.length > 500 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Tooltip title={expanded ? "Show less" : "Show more"}>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{ 
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatMessage; 