import React from "react";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import TableChartIcon from '@mui/icons-material/TableChart';
import BookIcon from '@mui/icons-material/Book';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 300;

const segments = [
  { icon: <ChatIcon />, label: "General Bot", path: "/", description: "Start a conversation" },
  { icon: <DescriptionIcon />, label: "PDF Bot", path: "/pdf", description: "Chat with documents", premium: true },
  { icon: <QuizIcon />, label: "QA Bot", path: "/qa", description: "Ask questions" },
  { icon: <TableChartIcon />, label: "Excel Bot", path: "/excel", description: "Analyze spreadsheets", premium: true },
  { icon: <BookIcon />, label: "Notebook Bot", path: "/notebook", description: "Work with notebooks", premium: true },
];

const premiumFeatures = [
  { icon: <AnalyticsIcon />, label: "Analytics", path: "/analytics", description: "Usage insights" },
  { icon: <StarIcon />, label: "Premium Features", path: "/premium", description: "Advanced capabilities" },
];

export default function Sidebar({ onSegmentSelect, selectedSegment, mode, setMode, isPremium, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, index) => {
    onSegmentSelect(index);
    navigate(path);
  };

  const getCurrentSegmentIndex = () => {
    const currentPath = location.pathname;
    return segments.findIndex(seg => seg.path === currentPath);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          background: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box sx={{ p: 2, pb: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: 36, 
              height: 36,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
            }}>
              🤖
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
                Kamachat
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
          <IconButton color="primary" size="small">
            <AddIcon />
          </IconButton>
        </Box>

        {/* Search */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'background.default', 
          borderRadius: 2, 
          px: 1.5, 
          py: 1, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase 
            placeholder="Search chats..." 
            fullWidth 
            sx={{ fontSize: 14 }}
          />
        </Box>

        {/* Main Navigation */}
        <Typography variant="caption" color="text.secondary" sx={{ pl: 1, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          AI Assistants
        </Typography>
        <List sx={{ mb: 2 }}>
          {segments.map((seg, idx) => (
            <ListItem
              button
              key={seg.label}
              selected={getCurrentSegmentIndex() === idx}
              onClick={() => handleNavigation(seg.path, idx)}
              sx={{ 
                borderRadius: 2, 
                mb: 0.5, 
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: getCurrentSegmentIndex() === idx ? 'inherit' : 'primary.main',
                minWidth: 40
              }}>
                {seg.icon}
              </ListItemIcon>
              <ListItemText 
                primary={seg.label} 
                secondary={seg.description}
                primaryTypographyProps={{ 
                  fontSize: 14, 
                  fontWeight: getCurrentSegmentIndex() === idx ? 600 : 500 
                }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
              {seg.premium && !isPremium && (
                <Chip 
                  label="PRO" 
                  size="small" 
                  color="secondary" 
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
            </ListItem>
          ))}
        </List>

        {/* Premium Features */}
        {isPremium && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ pl: 1, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Premium Features
            </Typography>
            <List sx={{ mb: 2 }}>
              {premiumFeatures.map((feature, idx) => (
                <ListItem
                  button
                  key={feature.label}
                  selected={location.pathname === feature.path}
                  onClick={() => navigate(feature.path)}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 0.5, 
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      },
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === feature.path ? 'inherit' : 'secondary.main',
                    minWidth: 40
                  }}>
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature.label} 
                    secondary={feature.description}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Recent Chats */}
        <Typography variant="caption" color="text.secondary" sx={{ pl: 1, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Recent Chats
        </Typography>
        <List sx={{ flex: 1, overflowY: 'auto', minHeight: 60 }}>
          <ListItem sx={{ borderRadius: 2, mb: 0.5, opacity: 0.7 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ChatIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Data Analysis Help" 
              secondary="2 hours ago"
              primaryTypographyProps={{ fontSize: 13 }}
              secondaryTypographyProps={{ fontSize: 11 }}
            />
          </ListItem>
          <ListItem sx={{ borderRadius: 2, mb: 0.5, opacity: 0.7 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TableChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Excel Formula Help" 
              secondary="1 day ago"
              primaryTypographyProps={{ fontSize: 13 }}
              secondaryTypographyProps={{ fontSize: 11 }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, pt: 0 }}>
        {/* User Profile */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'background.default',
          mb: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                border: '2px solid',
                borderColor: 'background.paper'
              }} />
            }
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name || 'Premium User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || 'premium@example.com'}
            </Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Action Buttons */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            borderRadius: 2, 
            fontWeight: 600, 
            py: 1.2, 
            mb: 1.5, 
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
            }
          }}
          startIcon={<AddIcon />}
        >
          New Chat
        </Button>

        {/* Settings and Theme Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title="Settings">
            <IconButton 
              onClick={() => navigate('/settings')} 
              color="inherit"
              size="small"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton 
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} 
              color="inherit"
              size="small"
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
} 