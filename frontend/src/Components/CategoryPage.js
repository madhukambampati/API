import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomInputLabel = styled(InputLabel)({
  //Before clicking on the input
  "&.Mui-focused": {
    //After clicking on the input
    top: "-10px",
  },
});

const CategoryPage = ({ title, description, endpoints, website }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [endpointData, setEndpointData] = useState(null);
  

  useEffect(() => {
    // For testing purposes, log endpoints when they change
    console.log('Endpoints:', endpoints);
    console.log('website:',website)

  }, [endpoints,website]);

  const handleEndpointChange = (event) => {
    const endpointName = event.target.value;
    setSelectedEndpoint(endpointName);
    const FullEndpointData = endpoints.find(
      (endpoint) => endpoint.name === endpointName
    );
    setEndpointData(FullEndpointData || null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="subtitle1">{description}</Typography>
      <FormControl fullWidth margin="normal">
        <CustomInputLabel>Select Endpoint</CustomInputLabel>
        <Select value={selectedEndpoint} onChange={handleEndpointChange}>
        {endpoints &&
            endpoints.map((endpoint) => (
              <MenuItem key={endpoint.name} value={endpoint.name}>
                {endpoint.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {endpointData && (
        <Box mt={3}>
          <Typography variant="h6">Endpoint Description:</Typography>
          <br />
          <Typography variant="body1">{endpointData.description}</Typography>
          <br>
          </br>
          <Typography variant="h6">Http Endpoint Link:</Typography>
          <pre>{JSON.stringify(endpointData.value, null, 2)}</pre>
          <br />
          <br />
          <br />
          <Typography variant="body1">
            For more information, please visit the website below:
            <br />
            <br />
            <a href={website} target="_blank" rel="noopener noreferrer">
              {website}
            </a>
</Typography>

        </Box>
      )}
    </Box>
  );
};

export default CategoryPage;