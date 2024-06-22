import React from 'react';
import { Box, Grid, Paper, Typography, Button, TextField } from '@mui/material';
import { styled } from '@mui/system';

const categories = [
  { title: 'Sports', description: 'APIs that encompass various sports-related data...' },
  { title: 'Finance', description: 'Finance APIs offer users diverse datasets and insights...' },
  { title: 'Data', description: 'Data APIs provide access to a wide range of datasets...' },
  { title: 'Entertainment', description: 'APIs for entertainment including movies, music, and games...' },
  { title: 'Travel', description: 'Travel APIs for booking, information, and reviews...' },
  { title: 'Location', description: 'Location-based APIs for maps and geolocation services...' },
  { title: 'Science', description: 'APIs providing scientific data and services...' },
  { title: 'Food', description: 'APIs for food-related information, recipes, and nutrition...' },
  { title: 'Tools', description: 'APIs offering various tools and utilities...' },
  { title: 'Text Analysis', description: 'APIs for text analysis and natural language processing...' },
  { title: 'Weather', description: 'APIs providing weather forecasts and data...' },
  { title: 'Gaming', description: 'APIs for game-related data and services...' },
  { title: 'SMS', description: 'APIs for sending and receiving SMS messages...' },
  { title: 'Events', description: 'APIs for event information and management...' },
  { title: 'Health and Fitness', description: 'APIs for health and fitness data...' }
];

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}));

const Home = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: '40px 20px', backgroundColor: '#f8f9fa' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button variant="contained" color="primary" href="/">
              Home
            </Button>
            <TextField
              id="search-bar"
              variant="outlined"
              placeholder="Search here"
              InputProps={{ endAdornment: <Button type="submit">Search</Button> }}
            />
          </Box>
        </Grid>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.title}>
            <Item>
              <Typography variant="h5" component="h2">
                {category.title}
              </Typography>
              <Typography variant="body2" component="p">
                {category.description}
              </Typography>
            </Item>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
