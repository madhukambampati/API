const express = require('express');
const router = express.Router();
const { getAllApiData } = require('../controllers/apiController');

// GET all API data
router.get('/', async (req, res) => {
  try {
    const apiData = await getAllApiData(userId);
    res.json(apiData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;

 