const ApiData = require('../models/apiData');

const getAllApiData = async () => {
  try {
    let apiData = await ApiData.find();
    console.log('Retrieved API data:', apiData); // Log the data
    return apiData;
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
};

module.exports = { getAllApiData };
