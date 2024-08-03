const express = require('express');
const router = express.Router();
const AdminUser = require('../models/adminUser')
const UserRegister = require('../models/userData')
const Category = require('../models/adminData'); // Adjust the path based on your file structure


// GET all API data
router.post('/', async (req, res) => {
    try {
        const adminUser = await AdminUser.findOne({ userName: req.body.userName });
        console.log('adminUser:', adminUser); 
        if (adminUser && adminUser.password === req.body.password) {
          userId= adminUser._id.toString();
          res.status(200).json({ loginStatus: true , userId : adminUser._id  })
        } else
            res.status(401).json({ loginStatus: false })


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.post('/register', async (req, res) => {
  try {
      const { userName, password } = req.body;

      // Check if the user already exists
      const existingUser = await AdminUser.findOne({ userName });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
      }
      // Create a new user
      const newUser = new UserRegister({ userName, password });

      // Save the user to the database
      await newUser.save();

      // Respond with a success message
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      // Respond with an error message if something goes wrong
      res.status(500).json({ message: 'Server error', error: error.message });
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
router.delete('/delete_category/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Category.findByIdAndDelete(id);
  
      if (!result) return res.status(404).json({ message: 'Category not found' });
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

module.exports = router;

