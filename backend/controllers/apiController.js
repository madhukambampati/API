const ApiData = require('../models/apiData');

const getAllApiData = async () => {
  try {
    // Fetch all API data for any logged-in user
    return await ApiData.find();
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
};

module.exports = { getAllApiData };
