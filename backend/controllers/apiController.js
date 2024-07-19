const ApiData = require('../models/apiData');

const getAllApiData = async () => {
  try {
    let apiData = await ApiData.find();
    return apiData;
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
};

module.exports = { getAllApiData };
