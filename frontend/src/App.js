import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import CategoryCard from "./Components/CategoryCard";
import CategoryPage from "./Components/CategoryPage.js";
import Footer from "./Components/Footer";
//import { FaBeer } from "react-icons/fa";
import "font-awesome/css/font-awesome.min.css";
import "./Styling/App.css";
import "./Styling/Header.css";
import "./Styling/Sidebar.css";
import "./Styling/CategoryCard.css";
import "./Styling/Footer.css";
//import { cardClasses } from "@mui/material";

const categories = [
  {
    icon: "🏀",

    title: "Sports",
    description: 'APIs that encompass various sports-related data, providing insights into matches, teams, and player statistics, enhancing sports analytics and fan engagement',
    endpoints: [
      { name: "/GetUsers", description: "Data about football matches..." },
      { name: "/GetTeams", description: "Data about basketball games..." },
    ],
  },

    {
      icon: "💰",
      title: "Finance",
      description: `Finance APIs provide users with varied data and insights.
        They offer tools for financial analysis, market trends, and economic data integration, 
        enhancing financial decision-making and application functionality.`,
      endpoints: [
        { name: "/GetUsers", description: "Retrieve user financial data and profiles..." },
        { name: "/GetCompanies", description: "Access comprehensive data about companies and market performance..." },
      ],
    },

  {
    icon: "📊",
    title: "Data",
    description: "Data APIs provide access to a wide range of datasets, offering information on diverse topics such as demographics, research findings, and scientific studies for research and application development.",
    endpoints: [
      { name: "/GetUsers", description: "Data about football matches..." },
      { name: "/GetSamples", description: "Data about basketball games..." },
    ],
  },
  {
    icon: "📺",
    title: "Entertainment",
    description: "APIs for entertainment including movies, music, and games, offering access to extensive databases, media content, and user reviews for personalized recommendations and content discovery",
    endpoints: [
      { name: "/GetUsers", description: "Data about football matches..." },
      { name: "/GetMovies", description: "Data about basketball games..." },
    ],
  },
  {
    icon: "🧭",
    title: "Travel",
    description: "Travel APIs for booking, information, and reviews, facilitating integration with travel services, destination information, and itinerary planning for enhanced travel experiences.",
    endpoints: [
      { name: "/GetUsers", description: "Data about football matches..." },
      {
        name: "/GetDestinations",
        description: "Data about basketball games...",
      },
    ],
  },
  {
    icon: "🗺️",
    title: "Location",
    description: "Location-based APIs for maps and geolocation services, offering functionalities such as geocoding, routing, and place search for seamless integration into location-aware applications and services.-based APIs for maps and geolocation services...",
    endpoints: [
      {
        name: "/GetStreetNames",
        description: "Data about football matches...",
      },
      {
        name: "/GetSpeedLimits",
        description: "Data about basketball games...",
      },
    ],
  },
  {
    icon: "🔭",
    title: "Science",
    description: "APIs providing scientific data and services, including space exploration data, weather observations, and chemical information, supporting scientific research, education, and innovation providing scientific data and services...",
    endpoints: [
      {
        name: "/GetSpaceData",
        description:
          "Data from space agencies and astronomical observations...",
      },
      {
        name: "/GetWeatherData",
        description: "Detailed weather information and forecasts...",
      },
      {
        name: "/GetChemicalData",
        description: "Information about chemical compounds and reactions...",
      },
    ],
  },
  {
    icon: "🥘",
    title: "Food",
    description: "APIs APIs for food-related information, recipes, and nutrition, offering access to recipes, nutritional data, and restaurant information for meal planning and dietary management. food-related information, recipes, and nutrition...",
    endpoints: [
      {
        name: "/GetRecipes",
        description:
          "Search for recipes by ingredients, cuisine, or dietary restrictions...",
      },
      {
        name: "/GetNutritionalData",
        description:
          "Information about food composition and nutritional value...",
      },
      {
        name: "/GetRestaurants",
        description: "Find restaurants near a location and explore menus...",
      },
    ],
  },
  {
    icon: "⚙️",
    title: "Tools",
    description: "APIs offering APIs offering various tools and utilities, including text analysis, image processing, and PDF manipulation, enabling developers to integrate advanced functionalities into applications for enhanced user interaction and data processing tools and utilities...",
    endpoints: [
      {
        name: "/GetTextAnalysis",
        description:
          "Analyze text for sentiment, keywords, and other insights...",
      },
      {
        name: "/GetImageProcessing",
        description:
          "Perform image recognition, manipulation, and editing tasks...",
      },
      {
        name: "/GetPDFProcessing",
        description: "Extract text, manipulate formatting, and convert PDFs...",
      },
    ],
  },
  {
    icon: "📰",
    title: "Text Analysis",
    description: "APIs for text analysis and natural language processing, providing capabilities such as sentiment analysis, entity extraction, and text summarization for extracting insights and enhancing content understanding",
    endpoints: [
      {
        name: "/GetSentimentAnalysis",
        description:
          "Determine the sentiment of a text (positive, negative, neutral)...",
      },
      {
        name: "/GetEntityExtraction",
        description:
          "Identify and extract key entities (people, places, organizations) from text...",
      },
      {
        name: "/GetTextSummarization",
        description: "Generate summaries of longer text content...",
      },
    ],
  },
  {
    icon: "☁️",
    title: "Weather",
    description: "APIs providing weather forecasts and historical data, offering real-time weather conditions, forecasts, and historical weather patterns for informed decision-making and planning",
    endpoints: [
      {
        name: "/GetCurrentWeather",
        description:
          "Get real-time weather conditions for a specific location...",
      },
      {
        name: "/GetForecasts",
        description: "Access weather forecasts for upcoming days or hours...",
      },
      {
        name: "/GetHistoricalData",
        description:
          "Retrieve historical weather data for a specific location...",
      },
    ],
  },
  {
    icon: "🕹️",
    title: "Gaming",
    description: "APIs for game-related APIs for game-related data and services, including game details, leaderboards, and live streaming information, supporting game developers and enthusiasts with access to gaming content and community engagement and services...",
    endpoints: [
      {
        name: "/GetGameDetails",
        description: "Retrieve information about specific video games...",
      },
      {
        name: "/GetLeaderboards",
        description: "Access leaderboards for various games and challenges...",
      },
      {
        name: "/GetStreamingData",
        description:
          "Find live streams and information about gaming content...",
      },
    ],
  },
  {
    icon: "💬",
    title: "SMS",
    description: "APIs APIs for sending and receiving SMS messages, offering functionalities such as message sending, receipt management, and delivery status tracking for efficient communication solutions.",
    endpoints: [
      {
        name: "/SendMessage",
        description: "Send SMS messages to a specific phone number...",
      },
      {
        name: "/ReceiveMessages",
        description: "Receive and manage incoming SMS messages...",
      },
      {
        name: "/GetDeliveryStatus",
        description: "Track the delivery status of sent SMS messages...",
      },
    ],
  },
  {
    icon: "🎟️",
    title: "Events",
    description: "APIs for event information APIs for event information and management, providing access to event details, registration services, and ticketing information for organizing and participating in events.",
    endpoints: [
      {
        name: "/GetEvents",
        description:
          "Search for events based on location, category, and date...",
      },
      {
        name: "/RegisterForEvent",
        description: "Register for an event and manage attendance...",
      },
      {
        name: "/GetTicketInformation",
        description:
          "Retrieve information about event tickets and manage purchases...",
      },
    ],
  },
  {
    icon: "🏋️",
    title: "Health and Fitness",
    description: "APIs for APIs for health and fitness data, offering access to health metrics, workout routines, and nutrition information for tracking personal fitness goals and managing wellness activities.",
    endpoints: [
      {
        name: "/GetHealthData",
        description:
          "Track health data like steps, heart rate, and calories burned...",
      },
      {
        name: "/GetWorkoutData",
        description:
          "Access workout routines, exercises, and training plans...",
      },
      {
        name: "/GetNutritionData",
        description: "Manage dietary intake and track nutritional goals...",
      },
    ],
  },
  {
    icon: "🧾",
    title: "Payments",
    description: "APIs for handling APIs for handling digital payments and transactions, supporting payment processing, transaction history management, and subscription management for seamless financial operations payments and transactions.",
    endpoints: [
      {
        name: "/MakePayment",
        description: "Process payments using various payment methods...",
      },
      {
        name: "/GetTransactionHistory",
        description: "View past transactions and manage payment history...",
      },
      {
        name: "/ManageSubscriptions",
        description: "Manage recurring subscriptions and payment plans...",
      },
    ],
  },
];

const getEndpointsForCurrentCategory = (location) => {
  const currentCategory = categories.find((category) =>
    location.pathname.includes(category.title.toLowerCase().replace(/ /g, "-"))
  );
  return currentCategory
    ? currentCategory.endpoints.map((endpoint) => endpoint.name)
    : [];
};

const App = () => {
  const location = useLocation(); // Define useLocation here
  const [filteredCategories, setFilteredCategories] = useState(categories);

  const onSearch = ({ value }) => {
    const filtered = categories.filter((category) =>
      category.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  return (
    <div className="app">
      <Header onSearch={onSearch} />
      <div className="main-container">
        {location.pathname === "/" ? (
          <Sidebar links={categories.map((category) => category.title)} />
        ) : (
          <Sidebar links={getEndpointsForCurrentCategory(location)} /> // Pass location prop
        )}
        <Routes>
          <Route
            path="/"
            element={
              <section className="categories-grid">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <CategoryCard
                      key={index}
                      icon={category.icon}
                      title={category.title}
                      description={category.description}
                    />
                  ))
                ) : (
                  <div className="no-cards">
                    <p className="no-cards-title">
                      There are no results that match your search.
                    </p>
                    <p className="no-cards-message">
                      Please try modifying your search to get more results.
                    </p>
                  </div>
                )}
              </section>
            }
          />
          {categories.map((category, index) => (
            <Route
              key={index}
              path={`/${category.title.toLowerCase().replace(/ /g, "-")}`}
              element={
                <CategoryPage
                  title={category.title}
                  description={category.description}
                />
              }
            />
          ))}
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;