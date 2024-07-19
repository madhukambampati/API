const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  value: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  endpoints: [endpointSchema],
  website: { type: String, required: true }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
