const ApiData = require('../models/apiData');

const getAllApiData = async (userId) => {
  try {
    if (!userId || userId === "66abfdc83039a12de90ba7d9") {
      return await ApiData.find();
    }
    
    // Otherwise, fetch data filtered by loggedUserId
    let apiData = await ApiData.find({ loggedUserId: userId });
    return apiData;
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
};

module.exports = { getAllApiData };
