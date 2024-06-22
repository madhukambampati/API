import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import CategoryCard from './Components/CategoryCard';
import CategoryPage from './Components/CategoryPage.js';
import Footer from './Components/Footer';
import 'font-awesome/css/font-awesome.min.css';
import './Styling/App.css';
import './Styling/Header.css';
import './Styling/Sidebar.css';
import './Styling/CategoryCard.css';
import './Styling/Footer.css';

const categories = [
    { title: 'Sports', description: 'APIs that encompass various sports-related data...', endpoints: [{ name: '/GetUsers', description: 'Data about football matches...' }, { name: '/GetTeams', description: 'Data about basketball games...' }] },
    { title: 'Finance', description: 'Finance APIs offer users diverse datasets and insights...', endpoints: [{ name: '/GetUsers', description: 'Data about football matches...' }, { name: '/GetCompanies', description: 'Data about basketball games...' }] },
    { title: 'Data', description: 'Data APIs provide access to a wide range of datasets...', endpoints: [{ name: '/GetUsers', description: 'Data about football matches...' }, { name: '/GetSamples', description: 'Data about basketball games...' }] },
    { title: 'Entertainment', description: 'APIs for entertainment including movies, music, and games...', endpoints: [{ name: '/GetUsers', description: 'Data about football matches...' }, { name: '/GetMovies', description: 'Data about basketball games...' }] },
    { title: 'Travel', description: 'Travel APIs for booking, information, and reviews...', endpoints: [{ name: '/GetUsers', description: 'Data about football matches...' }, { name: '/GetDestinations', description: 'Data about basketball games...' }] },
    { title: 'Location', description: 'Location-based APIs for maps and geolocation services...', endpoints: [{ name: '/GetStreetNames', description: 'Data about football matches...' }, { name: '/GetSpeedLimits', description: 'Data about basketball games...' }] },
    { title: 'Science', description: 'APIs providing scientific data and services...', endpoints: [{ name: '/GetSpaceData', description: 'Data from space agencies and astronomical observations...' }, { name: '/GetWeatherData', description: 'Detailed weather information and forecasts...' }, { name: '/GetChemicalData', description: 'Information about chemical compounds and reactions...' }] },
    { title: 'Food', description: 'APIs for food-related information, recipes, and nutrition...', endpoints: [{ name: '/GetRecipes', description: 'Search for recipes by ingredients, cuisine, or dietary restrictions...' }, { name: '/GetNutritionalData', description: 'Information about food composition and nutritional value...' }, { name: '/GetRestaurants', description: 'Find restaurants near a location and explore menus...' }] },
    { title: 'Tools', description: 'APIs offering various tools and utilities...', endpoints: [{ name: '/GetTextAnalysis', description: 'Analyze text for sentiment, keywords, and other insights...' }, { name: '/GetImageProcessing', description: 'Perform image recognition, manipulation, and editing tasks...' }, { name: '/GetPDFProcessing', description: 'Extract text, manipulate formatting, and convert PDFs...' }] },
    { title: 'Text Analysis', description: 'APIs for text analysis and natural language processing...', endpoints: [{ name: '/GetSentimentAnalysis', description: 'Determine the sentiment of a text (positive, negative, neutral)...' }, { name: '/GetEntityExtraction', description: 'Identify and extract key entities (people, places, organizations) from text...' }, { name: '/GetTextSummarization', description: 'Generate summaries of longer text content...' }] },
    { title: 'Weather', description: 'APIs providing weather forecasts and data...', endpoints: [{ name: '/GetCurrentWeather', description: 'Get real-time weather conditions for a specific location...' }, { name: '/GetForecasts', description: 'Access weather forecasts for upcoming days or hours...' }, { name: '/GetHistoricalData', description: 'Retrieve historical weather data for a specific location...' }] },
    { title: 'Gaming', description: 'APIs for game-related data and services...', endpoints: [{ name: '/GetGameDetails', description: 'Retrieve information about specific video games...' }, { name: '/GetLeaderboards', description: 'Access leaderboards for various games and challenges...' }, { name: '/GetStreamingData', description: 'Find live streams and information about gaming content...' }] },
    { title: 'SMS', description: 'APIs for sending and receiving SMS messages...', endpoints: [{ name: '/SendMessage', description: 'Send SMS messages to a specific phone number...' }, { name: '/ReceiveMessages', description: 'Receive and manage incoming SMS messages...' }, { name: '/GetDeliveryStatus', description: 'Track the delivery status of sent SMS messages...' }] },
    { title: 'Events', description: 'APIs for event information and management...', endpoints: [{ name: '/GetEvents', description: 'Search for events based on location, category, and date...' }, { name: '/RegisterForEvent', description: 'Register for an event and manage attendance...' }, { name: '/GetTicketInformation', description: 'Retrieve information about event tickets and manage purchases...' }] },
    { title: 'Health and Fitness', description: 'APIs for health and fitness data...', endpoints: [{ name: '/GetHealthData', description: 'Track health data like steps, heart rate, and calories burned...' }, { name: '/GetWorkoutData', description: 'Access workout routines, exercises, and training plans...' }, { name: '/GetNutritionData', description: 'Manage dietary intake and track nutritional goals...' }] },
    { title: 'Payments', description: 'APIs for handling digital payments and transactions...', endpoints: [{ name: '/MakePayment', description: 'Process payments using various payment methods...' }, { name: '/GetTransactionHistory', description: 'View past transactions and manage payment history...' }, { name: '/ManageSubscriptions', description: 'Manage recurring subscriptions and payment plans...' }] }
];

const getEndpointsForCurrentCategory = (location) => {
  const currentCategory = categories.find(category => location.pathname.includes(category.title.toLowerCase().replace(/ /g, '-')));
  return currentCategory ? currentCategory.endpoints.map(endpoint => endpoint.name) : [];
};

const App = () => {
  const location = useLocation(); // Define useLocation here

  return (
      <div className="app">
          <Header />
          <div className="main-container">
              {location.pathname === '/' ? (
                  <Sidebar links={categories.map(category => category.title)} />
              ) : (
                  <Sidebar links={getEndpointsForCurrentCategory(location)} /> // Pass location prop
              )}
              <Routes>
                  <Route
                      path="/"
                      element={
                          <section className="categories-grid">
                              {categories.map((category, index) => (
                                  <CategoryCard
                                      key={index}
                                      title={category.title}
                                      description={category.description}
                                  />
                              ))}
                          </section>
                      }
                  />
                  {categories.map((category, index) => (
                      <Route
                          key={index}
                          path={`/${category.title.toLowerCase().replace(/ /g, '-')}`}
                          element={<CategoryPage title={category.title} description={category.description} />}
                      />
                  ))}
              </Routes>
          </div>
          <Footer />
      </div>
  );
};

export default App;
