import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const TimeHorizonBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(1),
  border: '1px solid #e0e0e0',
}));

const GrowthModelBox = ({ growthModel, projectedGrowth }) => {
  const timeHorizons = {
    '1yr': '1 Year',
    '5yr': '5 Years',
    '10yr': '10 Years'
  };

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom color="primary">
        Growth Model Calculations
      </Typography>
      
      <Typography variant="body2" paragraph>
        {growthModel.description}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Key Assumptions:
      </Typography>
      <Box sx={{ mb: 2 }}>
        {growthModel.assumptions.map((assumption, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
            • {assumption}
          </Typography>
        ))}
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Market Factors:
      </Typography>
      <Box sx={{ mb: 2 }}>
        {growthModel.factors.map((factor, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
            • {factor}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Projected Returns by Time Horizon:
      </Typography>
      
      {Object.entries(timeHorizons).map(([key, label]) => (
        <TimeHorizonBox key={key}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {label} Projection: {projectedGrowth[key]}%
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Base Growth Rate → Risk-Adjusted Return → Final Compound Growth
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
            {growthModel.methodology}
          </Typography>
        </TimeHorizonBox>
      ))}
    </StyledPaper>
  );
};

export default GrowthModelBox; 