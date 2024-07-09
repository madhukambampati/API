const mongoose = require('mongoose');

const apiDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  endpoints: [
    {
      name: { type: String, required: true },
      description: { type: String },
    }
  ],
  website:{ type: String }
});

const ApiData = mongoose.model('ApiData', apiDataSchema,'categories');

module.exports = ApiData;
