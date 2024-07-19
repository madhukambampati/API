const express = require('express');
const router = express.Router();
const AdminUser = require('../models/adminUser')
const Category = require('../models/adminData'); // Adjust the path based on your file structure


// GET all API data
router.post('/', async (req, res) => {
    try {
        const adminUser = await AdminUser.findOne({ userName: req.body.userName });
        console.log('adminUser:', adminUser); 
        if (adminUser && adminUser.password === req.body.password) {
            res.status(200).json({ loginStatus: true })
        } else
            res.status(401).json({ loginStatus: false })


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.post('/create_category', async (req, res) => {
    try {
        // Create a new category instance with the data from the request body
        const category = new Category(req.body);
        // Save the category to the database
        await category.save();
        // Respond with the created category
        res.status(201).json(category);
      } catch (error) {
        // Respond with an error message if something goes wrong
        res.status(400).json({ error: error.message });
      }
});
module.exports = router;

