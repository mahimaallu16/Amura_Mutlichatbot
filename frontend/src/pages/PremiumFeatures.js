import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Support as SupportIcon,
  Diamond as DiamondIcon,
  Bolt as BoltIcon,
  Psychology as PsychologyIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  Description as DescriptionIcon,
  Book as BookIcon,
  Chat as ChatIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

export default function PremiumFeatures({ mode, setMode, isPremium, user }) {
  const [selectedSegment, setSelectedSegment] = useState(5);

  const premiumFeatures = [
    {
      icon: <TableChartIcon />,
      title: "Advanced Excel Analysis",
      description: "AI-powered spreadsheet analysis with natural language queries, formula generation, and data visualization",
      features: [
        "Natural language data queries",
        "Formula generation and debugging",
        "Advanced chart creation",
        "Data cleaning and transformation",
        "Multi-sheet analysis",
        "Export in multiple formats"
      ],
      color: "#6366f1"
    },
    {
      icon: <DescriptionIcon />,
      title: "PDF Document Intelligence",
      description: "Extract insights from PDFs with advanced OCR, table detection, and semantic understanding",
      features: [
        "Multi-page PDF processing",
        "Table and form extraction",
        "Image and chart analysis",
        "Document comparison",
        "Translation capabilities",
        "Voice query support"
      ],
      color: "#ec4899"
    },
    {
      icon: <BookIcon />,
      title: "Notebook Code Analysis",
      description: "Intelligent Jupyter notebook processing with code optimization and documentation generation",
      features: [
        "Code review and optimization",
        "Documentation generation",
        "Error detection and fixes",
        "Performance analysis",
        "Dependency management",
        "Interactive debugging"
      ],
      color: "#10b981"
    },
    {
      icon: <AnalyticsIcon />,
      title: "Advanced Analytics",
      description: "Comprehensive usage analytics and insights to optimize your workflow",
      features: [
        "Usage statistics and trends",
        "Performance metrics",
        "Cost optimization",
        "Custom reports",
        "Real-time monitoring",
        "Predictive analytics"
      ],
      color: "#f59e0b"
    },
    {
      icon: <SecurityIcon />,
      title: "Enterprise Security",
      description: "Bank-level security with encryption, access controls, and compliance features",
      features: [
        "End-to-end encryption",
        "Role-based access control",
        "Audit logging",
        "GDPR compliance",
        "SOC 2 certification",
        "Data residency options"
      ],
      color: "#ef4444"
    },
    {
      icon: <SpeedIcon />,
      title: "Premium Performance",
      description: "Lightning-fast processing with priority queues and dedicated resources",
      features: [
        "Priority processing",
        "Dedicated servers",
        "Faster response times",
        "Concurrent processing",
        "Auto-scaling",
        "99.9% uptime SLA"
      ],
      color: "#8b5cf6"
    }
  ];

  const usageStats = [
    { label: "Chats Used", value: user?.usage?.chats || 150, max: 1000, color: "primary" },
    { label: "Files Processed", value: user?.usage?.files || 25, max: 100, color: "secondary" },
    { label: "Storage Used", value: user?.usage?.storage || "2.5GB", max: "10GB", color: "success" }
  ];

  return (
    <div className="app-layout">
      <Sidebar 
        selectedSegment={selectedSegment} 
        onSegmentSelect={setSelectedSegment} 
        mode={mode} 
        setMode={setMode}
        isPremium={isPremium}
        user={user}
      />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopNavBar 
          selectedSegment={selectedSegment} 
          onSegmentSelect={setSelectedSegment} 
          mode={mode} 
          setMode={setMode}
        />
        
        <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <DiamondIcon sx={{ fontSize: 48, color: 'secondary.main', mr: 2 }} />
              <Typography variant="h2" fontWeight={700} sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Premium Features
              </Typography>
            </Box>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
              Unlock the full potential of AI-powered document analysis and data processing
            </Typography>
            <Chip 
              label="Premium Plan Active" 
              color="secondary" 
              icon={<StarIcon />}
              sx={{ fontSize: '1rem', py: 1, px: 2 }}
            />
          </Box>

          {/* Usage Statistics */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Your Usage
            </Typography>
            <Grid container spacing={3}>
              {usageStats.map((stat, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(typeof stat.value === 'number' ? stat.value : 25) / (typeof stat.max === 'number' ? stat.max : 100) * 100}
                      color={stat.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Max: {stat.max}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Premium Features Grid */}
          <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            Premium Capabilities
          </Typography>
          <Grid container spacing={3}>
            {premiumFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: feature.color, 
                        width: 48, 
                        height: 48, 
                        mr: 2 
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {feature.title}
                        </Typography>
                        <Chip 
                          label="Premium" 
                          size="small" 
                          color="secondary" 
                          icon={<StarIcon />}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {feature.description}
                    </Typography>

                    <List dense sx={{ p: 0 }}>
                      {feature.features.map((item, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={item} 
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      sx={{ 
                        borderColor: feature.color,
                        color: feature.color,
                        '&:hover': {
                          borderColor: feature.color,
                          bgcolor: `${feature.color}10`
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Additional Benefits */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Additional Premium Benefits
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SupportIcon sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Priority Support
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get dedicated support with faster response times and personalized assistance.
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="24/7 priority support" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Dedicated account manager" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Custom training sessions" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Advanced AI Models
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Access to the latest AI models with enhanced capabilities and accuracy.
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="GPT-4 and Claude models" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Custom model fine-tuning" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Early access to new features" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </div>
    </div>
  );
} 