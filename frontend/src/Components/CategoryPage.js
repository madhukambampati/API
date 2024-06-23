import React, { useState } from "react";
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

const mockData = {
  Sports: {
    "/GetUsers": {
      "@odata.context": "https://api.sports.com/v1.0/$metadata#users/$entity",
      value: [
        { id: "1", displayName: "Lionel Messi", position: "Forward" },
        { id: "2", displayName: "Cristiano Ronaldo", position: "Forward" },
      ],
    },
    "/GetTeams": {
      "@odata.context": "https://api.sports.com/v1.0/$metadata#teams/$entity",
      value: [
        { id: "1", displayName: "Team A", sport: "Soccer" },
        { id: "2", displayName: "Team B", sport: "Basketball" },
      ],
    },
  },
  Finance: {
    "/GetUsers": {
      "@odata.context": "https://api.finance.com/v1.0/$metadata#users/$entity",
      value: [
        { id: "1", displayName: "John Doe", role: "Analyst" },
        { id: "2", displayName: "Jane Smith", role: "Trader" },
      ],
    },
    "/GetCompanies": {
      "@odata.context":
        "https://api.finance.com/v1.0/$metadata#companies/$entity",
      value: [
        { id: "1", companyName: "Company A", industry: "Banking" },
        { id: "2", companyName: "Company B", industry: "Technology" },
      ],
    },
  },
  Data: {
    "/GetUsers": {
      "@odata.context": "https://api.data.com/v1.0/$metadata#users/$entity",
      value: [
        { id: "1", displayName: "Data User 1", role: "Data Scientist" },
        { id: "2", displayName: "Data User 2", role: "Analyst" },
      ],
    },
    "/GetSamples": {
      "@odata.context": "https://api.data.com/v1.0/$metadata#samples/$entity",
      value: [
        { id: "1", sampleName: "Sample A", type: "Dataset" },
        { id: "2", sampleName: "Sample B", type: "Dataset" },
      ],
    },
  },
  Entertainment: {
    "/GetUsers": {
      "@odata.context":
        "https://api.entertainment.com/v1.0/$metadata#users/$entity",
      value: [
        { id: "1", displayName: "Actor A", role: "Actor" },
        { id: "2", displayName: "Musician B", role: "Musician" },
      ],
    },
    "/GetMovies": {
      "@odata.context":
        "https://api.entertainment.com/v1.0/$metadata#movies/$entity",
      value: [
        { id: "1", movieName: "Movie A", genre: "Action" },
        { id: "2", movieName: "Movie B", genre: "Drama" },
      ],
    },
  },
  Travel: {
    "/GetUsers": {
      "@odata.context": "https://api.travel.com/v1.0/$metadata#users/$entity",
      value: [
        { id: "1", displayName: "Traveler A", destination: "Paris" },
        { id: "2", displayName: "Traveler B", destination: "Tokyo" },
      ],
    },
    "/GetDestinations": {
      "@odata.context":
        "https://api.travel.com/v1.0/$metadata#destinations/$entity",
      value: [
        { id: "1", destinationName: "Destination A", type: "Beach" },
        { id: "2", destinationName: "Destination B", type: "Mountain" },
      ],
    },
  },
  Location: {
    "/GetStreetNames": {
      "@odata.context":
        "https://api.location.com/v1.0/$metadata#streetNames/$entity",
      value: [
        { id: "1", streetName: "Main St" },
        { id: "2", streetName: "Second St" },
      ],
    },
    "/GetSpeedLimits": {
      "@odata.context":
        "https://api.location.com/v1.0/$metadata#speedLimits/$entity",
      value: [
        { id: "1", roadName: "Highway 1", speedLimit: "65 mph" },
        { id: "2", roadName: "Route 66", speedLimit: "55 mph" },
      ],
    },
  },
  Science: {
    "/GetSpaceData": {
      "@odata.context":
        "https://api.science.com/v1.0/$metadata#spaceData/$entity",
      value: [
        { id: "1", dataPoint: "Mars Rover Data" },
        { id: "2", dataPoint: "Hubble Telescope Images" },
      ],
    },
    "/GetWeatherData": {
      "@odata.context":
        "https://api.science.com/v1.0/$metadata#weatherData/$entity",
      value: [
        { id: "1", weather: "Sunny", location: "San Francisco" },
        { id: "2", weather: "Rainy", location: "Seattle" },
      ],
    },
    "/GetChemicalData": {
      "@odata.context":
        "https://api.science.com/v1.0/$metadata#chemicalData/$entity",
      value: [
        { id: "1", chemical: "H2O", description: "Water" },
        { id: "2", chemical: "CO2", description: "Carbon Dioxide" },
      ],
    },
  },
  Food: {
    "/GetRecipes": {
      "@odata.context": "https://api.food.com/v1.0/$metadata#recipes/$entity",
      value: [
        { id: "1", recipeName: "Spaghetti Bolognese", cuisine: "Italian" },
        { id: "2", recipeName: "Sushi", cuisine: "Japanese" },
      ],
    },
    "/GetNutritionalData": {
      "@odata.context":
        "https://api.food.com/v1.0/$metadata#nutritionalData/$entity",
      value: [
        { id: "1", foodItem: "Apple", calories: "95" },
        { id: "2", foodItem: "Banana", calories: "105" },
      ],
    },
    "/GetRestaurants": {
      "@odata.context":
        "https://api.food.com/v1.0/$metadata#restaurants/$entity",
      value: [
        { id: "1", restaurantName: "Restaurant A", location: "New York" },
        { id: "2", restaurantName: "Restaurant B", location: "Los Angeles" },
      ],
    },
  },
  Tools: {
    "/GetTextAnalysis": {
      "@odata.context":
        "https://api.tools.com/v1.0/$metadata#textAnalysis/$entity",
      value: [
        { id: "1", text: "This is a great day!", sentiment: "Positive" },
        { id: "2", text: "I am feeling sad.", sentiment: "Negative" },
      ],
    },
    "/GetImageProcessing": {
      "@odata.context":
        "https://api.tools.com/v1.0/$metadata#imageProcessing/$entity",
      value: [
        {
          id: "1",
          imageName: "Sunset",
          description: "A beautiful sunset over the ocean",
        },
        {
          id: "2",
          imageName: "Mountain",
          description: "A snow-covered mountain peak",
        },
      ],
    },
    "/GetPDFProcessing": {
      "@odata.context":
        "https://api.tools.com/v1.0/$metadata#pdfProcessing/$entity",
      value: [
        { id: "1", pdfName: "Report 2021", pages: 20 },
        { id: "2", pdfName: "Manual", pages: 15 },
      ],
    },
  },
  "Text Analysis": {
    "/GetSentimentAnalysis": {
      "@odata.context":
        "https://api.textanalysis.com/v1.0/$metadata#sentimentAnalysis/$entity",
      value: [
        { id: "1", text: "I love this product!", sentiment: "Positive" },
        { id: "2", text: "This is terrible.", sentiment: "Negative" },
      ],
    },
    "/GetEntityExtraction": {
      "@odata.context":
        "https://api.textanalysis.com/v1.0/$metadata#entityExtraction/$entity",
      value: [
        {
          id: "1",
          text: "Barack Obama was the 44th President of the United States.",
          entities: ["Barack Obama", "44th President", "United States"],
        },
        {
          id: "2",
          text: "The Eiffel Tower is in Paris.",
          entities: ["Eiffel Tower", "Paris"],
        },
      ],
    },
  },

  Weather: {
    "/GetWeatherForecast": {
      "@odata.context":
        "https://api.weather.com/v1.0/$metadata#weatherForecast/$entity",
      value: [
        {
          id: "1",
          location: "New York",
          forecast: "Partly cloudy",
          temperature: "25°C",
        },
        { id: "2", location: "London", forecast: "Rainy", temperature: "18°C" },
      ],
    },
    "/GetCurrentWeather": {
      "@odata.context":
        "https://api.weather.com/v1.0/$metadata#currentWeather/$entity",
      value: [
        {
          id: "1",
          location: "San Francisco",
          weather: "Sunny",
          temperature: "20°C",
        },
        { id: "2", location: "Tokyo", weather: "Cloudy", temperature: "22°C" },
      ],
    },
  },
  Gaming: {
    "/GetGameDetails": {
      "@odata.context":
        "https://api.gaming.com/v1.0/$metadata#gameDetails/$entity",
      value: [
        { id: "1", title: "Cyberpunk 2077", genre: "RPG", platform: "PC" },
        { id: "2", title: "FIFA 22", genre: "Sports", platform: "PlayStation" },
      ],
    },
    "/GetPlayerStats": {
      "@odata.context":
        "https://api.gaming.com/v1.0/$metadata#playerStats/$entity",
      value: [
        {
          id: "1",
          player: "John Doe",
          game: "Cyberpunk 2077",
          stats: { level: 30, kills: 150 },
        },
        {
          id: "2",
          player: "Jane Smith",
          game: "FIFA 22",
          stats: { goals: 20, assists: 10 },
        },
      ],
    },
  },
  SMS: {
    "/SendSMS": {
      "@odata.context": "https://api.sms.com/v1.0/$metadata#sendSMS/$entity",
      value: [
        {
          id: "1",
          sender: "+1234567890",
          recipient: "+9876543210",
          message: "Hello, how are you?",
        },
        {
          id: "2",
          sender: "+9876543210",
          recipient: "+1234567890",
          message: "I'm good, thanks!",
        },
      ],
    },
    "/ReceiveSMS": {
      "@odata.context": "https://api.sms.com/v1.0/$metadata#receiveSMS/$entity",
      value: [
        {
          id: "1",
          sender: "+1111111111",
          recipient: "+2222222222",
          message: "Meeting at 3 PM today.",
        },
        {
          id: "2",
          sender: "+2222222222",
          recipient: "+1111111111",
          message: "Confirmed, see you then.",
        },
      ],
    },
  },
  Events: {
    "/GetEventDetails": {
      "@odata.context":
        "https://api.events.com/v1.0/$metadata#eventDetails/$entity",
      value: [
        {
          id: "1",
          eventName: "Tech Summit 2024",
          location: "San Francisco",
          date: "2024-08-15",
        },
        {
          id: "2",
          eventName: "Music Festival",
          location: "London",
          date: "2024-07-20",
        },
      ],
    },
    "/GetAttendees": {
      "@odata.context":
        "https://api.events.com/v1.0/$metadata#attendees/$entity",
      value: [
        {
          id: "1",
          eventName: "Tech Summit 2024",
          attendees: ["John Doe", "Jane Smith", "Alex Brown"],
        },
        {
          id: "2",
          eventName: "Music Festival",
          attendees: ["Emma White", "Michael Green"],
        },
      ],
    },
  },
  "Health and Fitness": {
    "/GetFitnessActivities": {
      "@odata.context":
        "https://api.fitness.com/v1.0/$metadata#fitnessActivities/$entity",
      value: [
        {
          id: "1",
          activity: "Running",
          duration: "30 minutes",
          caloriesBurned: 300,
        },
        {
          id: "2",
          activity: "Yoga",
          duration: "45 minutes",
          caloriesBurned: 200,
        },
      ],
    },
    "/GetHealthRecords": {
      "@odata.context":
        "https://api.fitness.com/v1.0/$metadata#healthRecords/$entity",
      value: [
        {
          id: "1",
          date: "2024-06-15",
          weight: "70 kg",
          bloodPressure: "120/80 mmHg",
        },
        {
          id: "2",
          date: "2024-06-16",
          weight: "72 kg",
          bloodPressure: "118/78 mmHg",
        },
      ],
    },
  },
  Payments: {
    "/MakePayment": {
      "@odata.context":
        "https://api.payments.com/v1.0/$metadata#makePayment/$entity",
      value: [
        {
          id: "1",
          from: "John Doe",
          to: "Jane Smith",
          amount: "$100",
          status: "Success",
        },
        {
          id: "2",
          from: "Alice Brown",
          to: "Bob Green",
          amount: "$50",
          status: "Pending",
        },
      ],
    },
    "/GetTransactionHistory": {
      "@odata.context":
        "https://api.payments.com/v1.0/$metadata#transactionHistory/$entity",
      value: [
        {
          id: "1",
          date: "2024-06-15",
          from: "John Doe",
          to: "Jane Smith",
          amount: "$100",
          status: "Success",
        },
        {
          id: "2",
          date: "2024-06-16",
          from: "Alice Brown",
          to: "Bob Green",
          amount: "$50",
          status: "Pending",
        },
      ],
    },
  },
};

const CategoryPage = ({ title, description }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [endpointData, setEndpointData] = useState(null);

  const handleEndpointChange = (event) => {
    const endpoint = event.target.value;
    setSelectedEndpoint(endpoint);
    setEndpointData(mockData[title][endpoint] || null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="subtitle1">{description}</Typography>
      <FormControl fullWidth margin="normal">
        <CustomInputLabel>Select Endpoint</CustomInputLabel>
        <Select value={selectedEndpoint} onChange={handleEndpointChange}>
          {mockData[title] &&
            Object.keys(mockData[title]).map((endpoint) => (
              <MenuItem key={endpoint} value={endpoint}>
                {endpoint}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {endpointData && (
        <Box mt={3}>
          <Typography variant="h6">Endpoint Data:</Typography>
          <pre>{JSON.stringify(endpointData, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default CategoryPage;