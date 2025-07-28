import React from "react";
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function BotCard({ icon, title, desc, onClick }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardActionArea onClick={onClick}>
        <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
          {icon}
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>{desc}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
} 