const mongoose = require('mongoose');

const apiDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  endpoints: [
    {
      name: { type: String, required: true },
      description: { type: String },
      httplink : { type: String, required: true },
      apikey : { type: String, required: true },
      apihost : { type: String, required: true }
    }
  ],
  website:{ type: String }
});

const ApiData = mongoose.model('ApiData', apiDataSchema,'categories');

module.exports = ApiData;
