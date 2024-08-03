const ApiData = require('../models/apiData');

const getAllApiData = async (userId) => {
  try {
    let apiData = await ApiData.find({ loggedUserId: userId });
    return apiData;
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
};

module.exports = { getAllApiData };